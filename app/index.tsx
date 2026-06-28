/**
 * Entry route. In production this checks the Supabase session + whether the
 * profile/onboarding is complete, then routes accordingly. For the scaffold we
 * send first-time users into onboarding.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: branch on supabase.auth session + profile completeness.
  return <Redirect href="/(onboarding)/welcome" />;
}
