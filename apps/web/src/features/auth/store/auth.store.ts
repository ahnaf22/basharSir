import { create } from 'zustand';
import { apiClient } from '@/services/api-client';
import type { AuthUserDto, LinkedChildDto } from '@/features/auth/types/auth.types';

export interface AuthState {
  user: AuthUserDto | null;
  accessToken: string | null;
  linkedChildren: LinkedChildDto[];
  activeStudentCode: string | null;
  setSession: (user: AuthUserDto, accessToken: string | null) => void;
  updateUser: (user: AuthUserDto) => void;
  setLinkedChildren: (children: LinkedChildDto[]) => void;
  setActiveStudentCode: (studentCode: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  apiClient.configureAuth({
    getAccessToken: () => get().accessToken,
    getActiveStudentId: () => get().activeStudentCode,
    onUnauthorized: () => {
      set({
        user: null,
        accessToken: null,
        linkedChildren: [],
        activeStudentCode: null,
      });
    },
  });

  return {
    user: null,
    accessToken: null,
    linkedChildren: [],
    activeStudentCode: null,

    setSession: (user, accessToken) =>
      set({
        user,
        accessToken,
        activeStudentCode: user.student_profile?.student_code ?? null,
      }),

    updateUser: (user) =>
      set((state) => ({
        user,
        activeStudentCode:
          user.student_profile?.student_code ?? state.activeStudentCode,
      })),

    setLinkedChildren: (children) =>
      set((state) => {
        const firstCode = children[0]?.student.student_code ?? null;
        return {
          linkedChildren: children,
          activeStudentCode: state.activeStudentCode ?? firstCode,
        };
      }),

    setActiveStudentCode: (studentCode) => set({ activeStudentCode: studentCode }),

    clearSession: () =>
      set({
        user: null,
        accessToken: null,
        linkedChildren: [],
        activeStudentCode: null,
      }),
  };
});

