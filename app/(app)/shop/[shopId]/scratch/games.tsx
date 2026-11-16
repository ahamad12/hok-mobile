import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useCreateGame } from '@/features/scratch/api/scratch.mutations';
import { useScratchGames } from '@/features/scratch/api/scratch.queries';
import {
  CreateGameFormValues,
  createGameSchema,
} from '@/features/scratch/schemas/scratch.schemas';
import { gameTitle } from '@/features/scratch/utils/scratchUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { formatMoney, parseMoneyToCents } from '@/utils/money';

const EMPTY: CreateGameFormValues = {
  name: '',
  gameNumber: '',
  price: '',
  ticketsPerPack: '',
};

/** Scratch games this shop sells. OWNER/MANAGER add them. */
export default function ScratchGamesScreen() {
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const games = useScratchGames(shopId);
  const create = useCreateGame(shopId);
  const sheet = useRef<AppBottomSheetRef>(null);

  const { control, handleSubmit, setError, reset } =
    useForm<CreateGameFormValues>({
      resolver: zodResolver(createGameSchema),
      defaultValues: EMPTY,
      mode: 'onTouched',
    });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'name',
    'gameNumber',
  ]);

  const open = () => {
    reset(EMPTY);
    setFormError(null);
    sheet.current?.open();
  };

  const submit = handleSubmit((v) => {
    create.mutate(
      {
        name: v.name.trim(),
        gameNumber: v.gameNumber.trim() || undefined,
        priceCents: parseMoneyToCents(v.price) ?? 0,
        ticketsPerPack: Number(v.ticketsPerPack),
      },
      {
        onSuccess: (g) => {
          toast.success(`${g.name} added`);
          sheet.current?.close();
        },
        onError,
      },
    );
  });

  const list = games.data ?? [];

  return (
    <FormScreen
      title='Scratch games'
      footer={
        manages ? (
          <AppButton onPress={open} iconLeft='Plus' fullWidth>
            Add game
          </AppButton>
        ) : undefined
      }>
      {games.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : list.length === 0 ? (
        <EmptyState
          icon='Gamepad2'
          title='No games yet'
          body='Add each scratch game you sell with its price and pack size.'
        />
      ) : (
        <ListSection>
          {list.map((g) => (
            <ListItem
              key={g.id}
              icon='Gamepad2'
              title={gameTitle(g)}
              subtitle={`${g.ticketsPerPack} tickets per pack${g.isActive ? '' : ' · inactive'}`}
              value={formatMoney(g.priceCents)}
            />
          ))}
        </ListSection>
      )}

      <AppBottomSheet ref={sheet} title='Add scratch game'>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <FormField
            control={control}
            name='name'
            label='Name'
            placeholder='e.g. Lucky 7s'
          />
          <FormField
            control={control}
            name='gameNumber'
            label='Game number (optional)'
            placeholder='Printed on the ticket'
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                control={control}
                name='price'
                label='Ticket price'
                placeholder='5.00'
                keyboardType='decimal-pad'
              />
            </View>
            <View style={styles.flex}>
              <FormField
                control={control}
                name='ticketsPerPack'
                label='Tickets per pack'
                placeholder='50'
                keyboardType='number-pad'
              />
            </View>
          </View>
          <AppButton onPress={submit} loading={create.isPending} fullWidth>
            Add game
          </AppButton>
        </View>
      </AppBottomSheet>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
});
