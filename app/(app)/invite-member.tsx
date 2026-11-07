import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon, IconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { AppToggle } from '@/components/AppToggle';
import { ListItem, ListSection } from '@/components/ListItem';
import { OptionSheet, OptionSheetRef } from '@/components/OptionSheet';
import { useColors } from '@/contexts/ColorContext';
import { useCreateInvitation } from '@/features/auth/api/auth.mutations';
import { InvitableRole } from '@/features/auth/api/auth.types';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useUser } from '@/features/auth/hooks/useAuth';
import {
  CreateInvitationFormValues,
  createInvitationSchema,
} from '@/features/auth/schemas/auth.schemas';
import { invitableRoles } from '@/features/auth/utils/role';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useToast } from '@/hooks/useToast';
import { borderRadius, spacing } from '@/theme/Common';

const ROLE_INFO: Record<
  InvitableRole,
  { title: string; body: string; icon: IconName }
> = {
  MANAGER: {
    title: 'Manager',
    body: 'Runs the whole business. Can invite staff and manage every shop.',
    icon: 'BriefcaseBusiness',
  },
  STAFF: {
    title: 'Staff',
    body: 'Works at one shop. Supervisors get extra access in their shop.',
    icon: 'UserRound',
  },
};

/** Sends an invitation email; the invitee sets their own password. */
export default function InviteMemberScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shopId?: string }>();
  const user = useUser();
  const toast = useToast();
  const { colors } = useColors();
  const invite = useCreateInvitation();
  const shopsQuery = useMyShops();
  const shops = shopsQuery.data ?? [];
  const shopSheet = useRef<OptionSheetRef>(null);
  const roles = user ? invitableRoles(user.role) : [];
  // Owners and managers can assign a shop (managers: their owner's shops).
  const canPickShop = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const presetShop = params.shopId && canPickShop ? params.shopId : undefined;
  const { control, handleSubmit, setError, setValue } =
    useForm<CreateInvitationFormValues>({
      resolver: zodResolver(createInvitationSchema),
      defaultValues: {
        email: '',
        role: presetShop ? 'STAFF' : (roles[0] ?? 'STAFF'),
        shopId: presetShop,
        isSupervisor: false,
      },
      mode: 'onTouched',
    });
  const role = useWatch({ control, name: 'role' });
  const shopId = useWatch({ control, name: 'shopId' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'email',
    'role',
    'shopId',
    'isSupervisor',
  ]);

  if (roles.length === 0) return <Redirect href='/team' />;

  const selectedShop = shops.find((s) => s.id === shopId);

  const chooseRole = (r: InvitableRole) => {
    setValue('role', r);
    if (r === 'MANAGER') {
      setValue('shopId', undefined);
      setValue('isSupervisor', false);
    }
  };

  const onSubmit = ({
    isSupervisor,
    shopId: sid,
    ...rest
  }: CreateInvitationFormValues) => {
    setFormError(null);
    const input = {
      ...rest,
      ...(sid ? { shopId: sid } : {}),
      ...(isSupervisor ? { isSupervisor: true } : {}),
    };
    invite.mutate(input, {
      onError,
      onSuccess: () => {
        toast.success(
          `We emailed ${rest.email} a link to join.`,
          'Invitation sent',
        );
        router.back();
      },
    });
  };

  return (
    <FormScreen
      title='Invite to your team'
      dismiss='close'
      error={formError}
      footer={
        <AppButton
          onPress={handleSubmit(onSubmit)}
          loading={invite.isPending}
          iconLeft='Send'
          fullWidth>
          Send invitation
        </AppButton>
      }>
      <AppText variant='bodySmall' color='secondary'>
        They'll get an email with a link to set their name and password.
      </AppText>

      <FormField
        control={control}
        name='email'
        label='Email address'
        iconLeft='Mail'
        placeholder='name@example.com'
        autoCapitalize='none'
        autoCorrect={false}
        autoComplete='email'
        keyboardType='email-address'
        editable={!invite.isPending}
        required
      />

      <View style={styles.group}>
        <AppText variant='label' weight='semibold'>
          Role
        </AppText>
        {roles.map((r) => {
          const info = ROLE_INFO[r];
          const selected = role === r;
          return (
            <Pressable
              key={r}
              onPress={() => chooseRole(r)}
              accessibilityRole='radio'
              accessibilityState={{ selected }}
              accessibilityLabel={`${info.title}. ${info.body}`}
              style={[
                styles.roleCard,
                {
                  backgroundColor: selected
                    ? colors.background.inverse
                    : colors.background.surface,
                },
              ]}>
              <View
                style={[
                  styles.roleIcon,
                  {
                    backgroundColor: selected
                      ? 'rgba(127,127,127,0.22)'
                      : colors.background.default,
                  },
                ]}>
                <AppIcon
                  name={info.icon}
                  size={20}
                  color={selected ? colors.text.inverse : colors.icon.primary}
                />
              </View>
              <View style={styles.flex}>
                <AppText
                  weight='semibold'
                  customColor={selected ? colors.text.inverse : undefined}>
                  {info.title}
                </AppText>
                <AppText
                  variant='caption'
                  customColor={
                    selected ? colors.text.inverse : colors.text.secondary
                  }
                  style={selected ? styles.dim : undefined}>
                  {info.body}
                </AppText>
              </View>
              <AppIcon
                name={selected ? 'CircleCheck' : 'Circle'}
                size={22}
                color={selected ? colors.text.inverse : colors.icon.disabled}
              />
            </Pressable>
          );
        })}
      </View>

      {role === 'STAFF' ? (
        <ListSection
          title='Assignment'
          footer={
            canPickShop
              ? 'Supervisors must be assigned to a shop.'
              : 'Only the owner can assign a shop right now. Staff you invite can be added to a shop later.'
          }>
          {canPickShop ? (
            <Controller
              control={control}
              name='shopId'
              render={({ fieldState }) => (
                <ListItem
                  icon='Store'
                  iconTone='brand'
                  title={selectedShop?.name ?? 'Choose a shop'}
                  subtitle={
                    fieldState.error?.message ??
                    (selectedShop ? 'Shop' : 'Optional unless supervisor')
                  }
                  destructive={!!fieldState.error}
                  onPress={() => shopSheet.current?.open()}
                />
              )}
            />
          ) : (
            <ListItem
              icon='Store'
              title='No shop'
              subtitle='Assigned later by the owner'
            />
          )}
          <Controller
            control={control}
            name='isSupervisor'
            render={({ field, fieldState }) => (
              <ListItem
                icon='ShieldCheck'
                iconTone='info'
                title='Supervisor'
                subtitle={
                  fieldState.error?.message ?? 'Extra access within their shop'
                }
                trailing={
                  <AppToggle
                    value={Boolean(field.value)}
                    onValueChange={field.onChange}
                    disabled={!canPickShop}
                  />
                }
              />
            )}
          />
        </ListSection>
      ) : null}

      {canPickShop ? (
        <OptionSheet
          ref={shopSheet}
          title='Choose a shop'
          subtitle={
            shops.length === 0
              ? 'Add a shop first to assign staff to it.'
              : undefined
          }
          value={shopId ?? null}
          options={shops.map((s) => ({
            value: s.id,
            label: s.name,
            description: s.address?.city,
            icon: 'Store',
          }))}
          onSelect={(v) => setValue('shopId', v, { shouldValidate: true })}
        />
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: spacing[2] },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },
  dim: { opacity: 0.75 },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
