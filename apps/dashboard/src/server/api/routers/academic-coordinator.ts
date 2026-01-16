import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { ServiceClientRoot } from '/src/utils/api';
import handleTRPCError from '/src/utils/trpcErrorHandler';
import { SectionWithLevel } from '@cometa/trpc/src/types';

export const academicCoordinatorRouter = createTRPCRouter({
  academicCoordinatorSectionsListBySchoolList: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const response = await ServiceClientRoot.academicCoordinator.academicCoordinatorSectionsListBySchoolList(
          { school_id: input.schoolId },
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );
        return response.data as SectionWithLevel[];
      } catch (err) {
        handleTRPCError(err);
      }
    }),
  createMembership: protectedProcedure
    .input(
      z.object({
        user_id: z.string().uuid(),
        school_id: z.string().uuid(),
        membership: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const membershipPayload = {
          user_id: input.user_id,
          school_id: input.school_id,
          can_add_payment: true,
          can_add_discount: true,
          can_delete_manual_payment: true,
          can_assign_scholarship: true,
          can_deassign_scholarship: true,
          can_view_scholarships_and_discounts: true,
          can_assign_guardian: true,
          can_deassign_guardian: true,
          can_edit_guardian: true,
          can_assign_billing_guardian: true,
          can_add_concept_assignment: true,
          can_edit_concept_assignment: true,
          can_delete_concept_assignment: true,
          can_add_student: true,
          can_edit_student: true,
          can_view_student_status: true,
          can_view_student_total_debt: true,
          can_send_whatsapp: true,
          can_add_concept: true,
          can_edit_stock: true,
          can_view_collections_page: true,
          can_view_received_payment_page: true,
          can_view_delinquency_page: true,
          can_view_concepts_page: true,
          can_view_income_stats_cards: true,
          can_view_registered_payments_table: true,
          can_view_payouts_table: true,
          can_view_income_page: true,
        };

        const response = await ServiceClientRoot.academicCoordinator.academicCoordinatorMembershipsCreate(
          membershipPayload,
          {
            headers: {
              Authorization: `Token ${ctx.session.token}`,
            },
          }
        );

        return response.data;
      } catch (err) {
        return handleTRPCError(err);
      }
    }),
});
