import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppToggle } from '@/components/AppToggle';
import { AppView } from '@/components/AppView';
import { useCreateInvitation } from '@/features/auth/api/auth.mutations';
import { useMyShops } from '@/features/auth/api/auth.queries';
import {
  AuthScreen,
  FormField,
  useServerErrors,
} from '@/features/auth/components';
import { useUser } from '@/features/auth/hooks/useAuth';
import {
  CreateInvitationFormValues,
  createInvitationSchema,
} from '@/features/auth/schemas/auth.schemas';
import { invitableRoles } from '@/features/auth/utils/role';
import { useToast } from '@/hooks/useToast';

/** Sends an invitation email; the invitee sets their own password. */
export default function InviteScreen() {
  const router = useRouter();
  const user = useUser();
  const toast = useToast();
  const invite = useCreateInvitation();
  const { data: shops = [] } = useMyShops();
  const roles = user ? invitableRoles(user.role) : [];

  const { control, handleSubmit, setError, setValue } =
    useForm<CreateInvitationFormValues>({
      resolver: zodResolver(createInvitationSchema),
      defaultValues: { email: '', role: roles[0] ?? 'STAFF' },
      mode: 'onTouched',
    });
  const role = useWatch({ control, name: 'role' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'email',
    'role',
    'shopId',
    'isSupervisor',
  ]);

  if (roles.length === 0) return <Redirect href='/(tabs)' />;

  const onSubmit = (values: CreateInvitationFormValues) => {
    setFormError(null);
    invite.mutate(values, {
      onError,
      onSuccess: () => {
        toast.success(`Invitation sent to ${values.email}`);
        router.back();
      },
    });
  };

  return (
    <AuthScreen
      title='Invite a team member'
      subtitle='They get an email link to set up their account.'
      error={formError}>
      <FormField
        control={control}
        name='email'
        label='Email'
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType='email-address'
        editable={!invite.isPending}
      />

      <AppText variant='bodySmall' color='secondary'>
        Role
      </AppText>
      <AppView row gap={2}>
        {roles.map((r) => (
          <AppButton
            key={r}
            size='sm'
            variant={role === r ? 'primary' : 'outline'}
            onPress={() => {
              setValue('role', r);
              if (r === 'MANAGER') {
                setValue('shopId', undefined);
                setValue('isSupervisor', undefined);
              }
            }}>
            {r === 'MANAGER' ? 'Manager' : 'Staff'}
          </AppButton>
        ))}
      </AppView>

      {role === 'STAFF' && (
        <>
          <AppText variant='bodySmall' color='secondary'>
            Shop
          </AppText>
          <Controller
            control={control}
            name='shopId'
            render={({ field, fieldState }) => (
              <AppView gap={2}>
                <AppView row wrap gap={2}>
                  {shops.map((s) => (
                    <AppButton
                      key={s.id}
                      size='sm'
                      variant={field.value === s.id ? 'primary' : 'outline'}
                      onPress={() =>
                        field.onChange(field.value === s.id ? undefined : s.id)
                      }>
                      {s.name}
                    </AppButton>
                  ))}
                  {shops.length === 0 && (
                    <AppText color='secondary'>No shops yet.</AppText>
                  )}
                </AppView>
                {fieldState.error && (
                  <AppText color='error' variant='bodySmall'>
                    {fieldState.error.message}
                  </AppText>
                )}
              </AppView>
            )}
          />
          <Controller
            control={control}
            name='isSupervisor'
            render={({ field }) => (
              <AppView row align='center' justify='space-between'>
                <AppText>Supervisor</AppText>
                <AppToggle
                  value={Boolean(field.value)}
                  onValueChange={field.onChange}
                />
              </AppView>
            )}
          />
        </>
      )}

      <AppButton
        onPress={handleSubmit(onSubmit)}
        loading={invite.isPending}
        disabled={invite.isPending}
        fullWidth>
        Send invitation
      </AppButton>
    </AuthScreen>
  );
}
