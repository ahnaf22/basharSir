import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/services/api-client';
import { fetchAuthMeApi } from '@/features/auth/api/auth.api';
import type {
  AuthUserDto,
  LinkedChildDto,
  EntitlementsSnapshotDto,
} from '@/features/auth/types/auth.types';

export interface AuthState {
  user: AuthUserDto | null;
  accessToken: string | null;
  linkedChildren: LinkedChildDto[];
  activeStudentCode: string | null;
  entitlements: EntitlementsSnapshotDto | null;
  isHydrated: boolean;
  isLoading: boolean;

  setSession: (
    user: AuthUserDto,
    accessToken: string | null,
    entitlements?: EntitlementsSnapshotDto | null
  ) => void;
  updateUser: (user: AuthUserDto) => void;
  setEntitlements: (entitlements: EntitlementsSnapshotDto | null) => void;
  setLinkedChildren: (children: LinkedChildDto[]) => void;
  setActiveStudentCode: (studentCode: string | null) => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
  canAccess: (featureKey: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Configure api client with dynamic token getter
      apiClient.configureAuth({
        getAccessToken: () => get().accessToken,
        getActiveStudentId: () => get().activeStudentCode,
        onUnauthorized: () => {
          get().clearSession();
        },
      });

      return {
        user: null,
        accessToken: null,
        linkedChildren: [],
        activeStudentCode: null,
        entitlements: null,
        isHydrated: false,
        isLoading: false,

        setSession: (user, accessToken, entitlements = null) => {
          if (typeof window !== 'undefined') {
            if (accessToken) {
              localStorage.setItem('auth_token', accessToken);
            } else {
              localStorage.removeItem('auth_token');
            }
          }

          const defaultStudentCode =
            user.student_profile?.student_code ?? null;

          if (defaultStudentCode && typeof window !== 'undefined') {
            localStorage.setItem('active_student_code', defaultStudentCode);
          }

          set({
            user,
            accessToken,
            entitlements: entitlements ?? get().entitlements,
            activeStudentCode: defaultStudentCode,
          });

          // Fetch fresh entitlements & profile from backend
          if (accessToken) {
            get().refreshUser();
          }
        },

        updateUser: (user) => {
          const defaultStudentCode =
            user.student_profile?.student_code ?? get().activeStudentCode;
          set({
            user,
            activeStudentCode: defaultStudentCode,
          });
        },

        setEntitlements: (entitlements) => set({ entitlements }),

        setLinkedChildren: (children) =>
          set((state) => {
            const firstCode = children[0]?.student.student_code ?? null;
            const activeCode = state.activeStudentCode ?? firstCode;
            if (activeCode && typeof window !== 'undefined') {
              localStorage.setItem('active_student_code', activeCode);
            }
            return {
              linkedChildren: children,
              activeStudentCode: activeCode,
            };
          }),

        setActiveStudentCode: (studentCode) => {
          if (typeof window !== 'undefined') {
            if (studentCode) {
              localStorage.setItem('active_student_code', studentCode);
            } else {
              localStorage.removeItem('active_student_code');
            }
          }
          set({ activeStudentCode: studentCode });
        },

        clearSession: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('active_student_code');
          }
          set({
            user: null,
            accessToken: null,
            linkedChildren: [],
            activeStudentCode: null,
            entitlements: null,
          });
        },

        refreshUser: async () => {
          const token = get().accessToken;
          if (!token) return;

          set({ isLoading: true });
          try {
            const res = await fetchAuthMeApi();
            if (res.data) {
              const { user, linked_children, entitlements } = res.data;
              set({
                user,
                linkedChildren: linked_children ?? [],
                entitlements: entitlements ?? null,
                activeStudentCode:
                  get().activeStudentCode ??
                  user.student_profile?.student_code ??
                  linked_children?.[0]?.student.student_code ??
                  null,
              });
            }
          } catch {
            // Handled by onUnauthorized if 401
          } finally {
            set({ isLoading: false });
          }
        },

        canAccess: (featureKey: string) => {
          const features = get().entitlements?.features;
          if (!features) return false;
          return features[featureKey]?.can_access ?? false;
        },
      };
    },
    {
      name: 'basharsir_auth_state',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        linkedChildren: state.linkedChildren,
        activeStudentCode: state.activeStudentCode,
        entitlements: state.entitlements,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Sync localStorage keys
          if (state.accessToken && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', state.accessToken);
          }
          if (state.activeStudentCode && typeof window !== 'undefined') {
            localStorage.setItem('active_student_code', state.activeStudentCode);
          }
          // Bootstrap fresh session if token present
          if (state.accessToken) {
            state.refreshUser();
          }
        }
      },
    }
  )
);
