import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet } from '@/services/apiRequest';

import { TeamMember } from './team.types';

/** OWNER/MANAGER only: everyone in the business, owner first. */
export async function getTeamMembers(): Promise<TeamMember[]> {
  return (await apiGet<{ members: TeamMember[] }>(ENDPOINTS.TEAM.MEMBERS))
    .members;
}
