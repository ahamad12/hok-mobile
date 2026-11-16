// Body lives in the feature; owners and managers only.
import { withPageAccess } from '@/features/shops/components/PageGate';
import Screen from '@/features/shops/screens/RecordsScreen';

export default withPageAccess('records', 'Records', Screen);
