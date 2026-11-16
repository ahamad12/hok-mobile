import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect } from '@/components/FormSelect';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { SkeletonRow } from '@/components/Skeleton';
import { StatTile } from '@/components/StatTile';
import { FormField, useServerErrors } from '@/features/auth/components';
import {
  useCreateExpense,
  useCreateExpenseCategory,
  useVoidExpense,
} from '@/features/money/api/money.mutations';
import {
  useExpenseCategories,
  useExpenses,
} from '@/features/money/api/money.queries';
import { Expense } from '@/features/money/api/money.types';
import {
  ExpenseFormValues,
  expenseSchema,
} from '@/features/money/schemas/money.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import {
  formatBusinessDay,
  isoToBusinessDate,
  monthRange,
  today,
} from '@/utils/businessDate';
import { formatMoney, parseMoneyToCents } from '@/utils/money';

/** OWNER/MANAGER only (server @Roles on every expense route). */
export default function ExpensesScreen() {
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const month = monthRange();
  const expenses = useExpenses(shopId, month.from, month.to);
  const categories = useExpenseCategories(shopId);
  const create = useCreateExpense(shopId);
  const voidExpense = useVoidExpense(shopId);
  const createCategory = useCreateExpenseCategory(shopId);
  const sheet = useRef<AppBottomSheetRef>(null);
  const categorySheet = useRef<AppBottomSheetRef>(null);
  const reason = useRef<ReasonSheetRef>(null);
  const [newCategory, setNewCategory] = useState('');

  const empty: ExpenseFormValues = {
    categoryId: '',
    amount: '',
    description: '',
    expenseDate: today(),
  };
  const { control, handleSubmit, setError, reset } = useForm<ExpenseFormValues>(
    {
      resolver: zodResolver(expenseSchema),
      defaultValues: empty,
      mode: 'onTouched',
    },
  );
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'categoryId',
    'amount',
    'description',
    'expenseDate',
  ]);

  if (!manages) {
    return (
      <FormScreen title='Expenses'>
        <EmptyState icon='Lock' title='Owners and managers only' />
      </FormScreen>
    );
  }

  const cats = (categories.data ?? []).filter((c) => c.isActive);
  const catName = (id: string) =>
    categories.data?.find((c) => c.id === id)?.name ?? 'Expense';
  const live = (expenses.data?.expenses ?? []).filter((e) => !e.voidedAt);
  const total = live.reduce((n, e) => n + e.amount, 0);

  const openAdd = () => {
    reset(empty);
    setFormError(null);
    sheet.current?.open();
  };

  const submit = handleSubmit((v) => {
    create.mutate(
      {
        categoryId: v.categoryId,
        amount: parseMoneyToCents(v.amount) ?? 0,
        description: v.description.trim(),
        expenseDate: v.expenseDate,
      },
      {
        onSuccess: () => {
          toast.success('Expense added');
          sheet.current?.close();
        },
        onError,
      },
    );
  });

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    createCategory.mutate(
      { name },
      {
        onSuccess: () => {
          toast.success(`${name} added`);
          setNewCategory('');
          categorySheet.current?.close();
        },
        onError: () => toast.error("Couldn't add the category"),
      },
    );
  };

  const askVoid = (e: Expense) =>
    reason.current?.ask({
      title: 'Void this expense?',
      message: `${formatMoney(e.amount)} stops counting toward profit. It stays on record.`,
      confirmLabel: 'Void expense',
      onConfirm: (r) =>
        voidExpense
          .mutateAsync({ id: e.id, reason: r })
          .then(() => toast.success('Expense voided')),
    });

  return (
    <FormScreen
      title='Expenses'
      footer={
        <AppButton
          onPress={openAdd}
          iconLeft='Plus'
          fullWidth
          disabled={cats.length === 0}>
          Add expense
        </AppButton>
      }>
      <View style={styles.tiles}>
        <StatTile
          label='This month'
          value={formatMoney(total)}
          hint={`${live.length} expenses`}
          loading={expenses.isLoading}
        />
      </View>

      <ListSection
        title='Categories'
        action={
          <AppButton
            variant='ghost'
            size='sm'
            onPress={() => categorySheet.current?.open()}>
            Add
          </AppButton>
        }>
        {cats.length === 0 ? (
          <ListItem
            icon='FolderPlus'
            title='Add a category first'
            subtitle='e.g. Rent, Wages, Electricity'
            onPress={() => categorySheet.current?.open()}
          />
        ) : (
          <ListItem
            icon='Folders'
            title={cats.map((c) => c.name).join(', ')}
            titleLines={3}
          />
        )}
      </ListSection>

      <ListSection title='This month'>
        {expenses.isLoading ? (
          <SkeletonRow />
        ) : (expenses.data?.expenses.length ?? 0) === 0 ? (
          <ListItem icon='Receipt' title='No expenses this month' />
        ) : (
          expenses.data?.expenses.map((e) => (
            <ListItem
              key={e.id}
              icon={e.voidedAt ? 'Ban' : 'Receipt'}
              iconTone={e.voidedAt ? 'error' : 'neutral'}
              title={e.description}
              subtitle={`${catName(e.categoryId)} · ${formatBusinessDay(isoToBusinessDate(e.expenseDate))}${e.voidedAt ? ' · voided' : ''}`}
              value={formatMoney(e.amount)}
              onPress={e.voidedAt ? undefined : () => askVoid(e)}
              chevron={false}
            />
          ))
        )}
      </ListSection>

      <AppBottomSheet ref={sheet} title='Add expense'>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <FormSelect
            control={control}
            name='categoryId'
            label='Category'
            options={cats.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FormField
            control={control}
            name='amount'
            label='Amount'
            placeholder='0.00'
            keyboardType='decimal-pad'
          />
          <FormField
            control={control}
            name='description'
            label='What was it for?'
            placeholder='e.g. November rent'
          />
          <FormField
            control={control}
            name='expenseDate'
            label='Date'
            placeholder='YYYY-MM-DD'
            keyboardType='numbers-and-punctuation'
          />
          <AppButton onPress={submit} loading={create.isPending} fullWidth>
            Add expense
          </AppButton>
        </View>
      </AppBottomSheet>

      <AppBottomSheet ref={categorySheet} title='New expense category'>
        <View style={styles.sheet}>
          <AppInput
            label='Name'
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder='e.g. Electricity'
            maxLength={100}
          />
          <AppButton
            onPress={addCategory}
            loading={createCategory.isPending}
            disabled={!newCategory.trim()}
            fullWidth>
            Add category
          </AppButton>
        </View>
      </AppBottomSheet>
      <ReasonSheet ref={reason} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing[3] },
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
});
