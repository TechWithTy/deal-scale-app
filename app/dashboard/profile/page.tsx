import { Breadcrumbs } from '@/components/breadcrumbs';
import { CreateProfileUpdated } from '@/components/forms/user-profile-stepper/updated-create-profile';
import PageContainer from '@/components/layout/page-container';
import { mockUserProfile } from '@/constants/_faker/profile/userProfile';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Profile', link: '/dashboard/profile' }
];
export default function page() {
  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <CreateProfileUpdated initialData={mockUserProfile} />
      </div>
    </PageContainer>
  );
}
