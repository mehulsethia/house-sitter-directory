import { houseSitterRepo } from '../repositories/house-sitter.repo'
import { db } from '../db'
import { ServiceError } from './booking.service'
import { loopsEmailService } from './loops-email.service'
import { pushInAppNotification } from './in-app-notification.service'
import type { User } from '@prisma/client'
import {
  HouseSitterRejectionReasonCode,
  composeCleanerRejectionMessage,
  rejectionFixGuidance,
} from '@/lib/house-sitter-status'

const STRIKE_SUSPEND_THRESHOLD = 3

export const houseSitterService = {
  async approve(
    houseSitterId: string,
    adminUser: User,
    action: 'approve' | 'reject',
    rejectionReason?: string,
    rejectionReasonCode?: HouseSitterRejectionReasonCode,
    rejectionCustomMessage?: string,
  ) {
    const houseSitter = await houseSitterRepo.findById(houseSitterId)
    if (!houseSitter) throw new ServiceError('HouseSitter not found', 404)
    if (houseSitter.status !== 'pending') throw new ServiceError('HouseSitter is not in pending status', 400)
    const resolvedRejectionMessage = composeCleanerRejectionMessage({
      reasonCode: rejectionReasonCode,
      customMessage: rejectionCustomMessage ?? rejectionReason,
    })

    const updated = await houseSitterRepo.update(houseSitterId, {
      status: action === 'approve' ? 'approved' : 'rejected',
      rejectionReason: action === 'reject' ? resolvedRejectionMessage : null,
      approvedAt: action === 'approve' ? new Date() : null,
      approvedBy: action === 'approve' ? adminUser.id : null,
    })

    await pushInAppNotification({
      userId: updated.userId,
      type: action === 'approve' ? 'house_sitter_application_approved' : 'house_sitter_application_rejected',
      title: action === 'approve' ? 'HouseSitter profile approved' : 'HouseSitter profile rejected',
      body:
        action === 'approve'
          ? updated.stripeOnboardingComplete
            ? 'Your profile is approved and live for houseSit bookings.'
            : 'Your profile is approved. Connect Stripe to go live.'
          : `Your houseSitter profile was rejected: ${resolvedRejectionMessage} ${rejectionFixGuidance(rejectionReasonCode)}`,
      data: {
        house_sitter_id: updated.id,
        rejection_reason_code: rejectionReasonCode ?? null,
      },
    })

    try {
      if (action === 'approve') {
        await loopsEmailService.sendCleanerApplicationApproved({
          email: updated.user.email,
          fullName: updated.user.name ?? 'HouseSitter',
        })
      } else {
        await loopsEmailService.sendCleanerApplicationRejected({
          email: updated.user.email,
          fullName: updated.user.name ?? 'HouseSitter',
        })
      }
    } catch (emailError) {
      console.error('Failed to send houseSitter application status email via Loops:', emailError)
    }

    return updated
  },

  async issueStrike(
    houseSitterId: string,
    issuedBy: string | null,
    strikeType: string,
    reason: string,
    bookingId?: string,
  ) {
    await db.houseSitterStrike.create({
      data: {
        houseSitterId,
        strikeType,
        reason,
        issuedBy,
        bookingId,
      },
    })

    const strikeCount = await houseSitterRepo.countStrikes(houseSitterId)
    if (strikeCount >= STRIKE_SUSPEND_THRESHOLD) {
      await houseSitterRepo.update(houseSitterId, { status: 'suspended' })
    }

    return strikeCount
  },

  async toggleSuspension(houseSitterId: string) {
    const houseSitter = await houseSitterRepo.findById(houseSitterId)
    if (!houseSitter) throw new ServiceError('HouseSitter not found', 404)

    const suspend = houseSitter.status !== 'suspended'
    return houseSitterRepo.suspend(houseSitterId, suspend)
  },
}
