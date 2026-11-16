// Body lives in the feature; owners and managers only.
import Screen from '@/features/money/screens/FinanceScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';

export default withPageAccess('finance', 'Finance', Screen);
