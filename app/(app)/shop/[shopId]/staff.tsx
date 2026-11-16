// Owners and managers only.
import { withPageAccess } from '@/features/shops/components/PageGate';
import Screen from '@/features/shops/screens/ShopStaffScreen';

export default withPageAccess('staff', 'Staff in this shop', Screen);
