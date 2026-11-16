import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect } from '@/components/FormSelect';
import { SegmentedControl } from '@/components/SegmentedControl';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useReceivePack } from '@/features/scratch/api/scratch.mutations';
import { useScratchGames } from '@/features/scratch/api/scratch.queries';
import { ScratchPackLocation } from '@/features/scratch/api/scratch.types';
import {
  ReceivePackFormValues,
  receivePackSchema,
} from '@/features/scratch/schemas/scratch.schemas';
import { gameTitle } from '@/features/scratch/utils/scratchUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { formatMoney } from '@/utils/money';

export default function ReceivePackScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const games = useScratchGames(shopId);
  const receive = useReceivePack(shopId);
  const active = (games.data ?? []).filter((g) => g.isActive);

  const { control, handleSubmit, setError } = useForm<ReceivePackFormValues>({
    resolver: zodResolver(receivePackSchema),
    defaultValues: { gameId: '', serialStart: '000', location: 'DISPLAY' },
    mode: 'onTouched',
  });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'gameId',
    'serialStart',
    'location',
  ]);

  const submit = handleSubmit((v) => {
    setFormError(null);
    receive.mutate(v, {
      onSuccess: () => {
        toast.success('Pack received');
        router.back();
      },
      onError,
    });
  });

  if (!games.isLoading && active.length === 0) {
    return (
      <FormScreen title='Receive pack'>
        <EmptyState
          icon='Gamepad2'
          title='No scratch games yet'
          body={
            manages
              ? 'Add the game first: its name, ticket price and pack size.'
              : 'Ask an owner or manager to add the game first.'
          }
          actionLabel={manages ? 'Add a game' : undefined}
          actionIcon='Plus'
          onAction={() =>
            router.replace({
              pathname: '/shop/[shopId]/scratch/games',
              params: { shopId },
            })
          }
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title='Receive pack'
      error={formError}
      footer={
        <AppButton onPress={submit} loading={receive.isPending} fullWidth>
          Receive pack
        </AppButton>
      }>
      <FormSelect
        control={control}
        name='gameId'
        label='Game'
        placeholder='Choose a game'
        options={active.map((g) => ({
          value: g.id,
          label: gameTitle(g),
          description: `${formatMoney(g.priceCents)} · ${g.ticketsPerPack} tickets`,
        }))}
      />
      <FormField
        control={control}
        name='serialStart'
        label='First ticket serial'
        helperText='Usually 000. Three digits.'
        keyboardType='number-pad'
        maxLength={3}
      />
      <Controller
        control={control}
        name='location'
        render={({ field }) => (
          <SegmentedControl<ScratchPackLocation>
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'DISPLAY', label: 'Put on display' },
              { value: 'BACKSTOCK', label: 'Backstock' },
            ]}
          />
        )}
      />
    </FormScreen>
  );
}
