'use client'; // Ensure it's a client-side component

import { useState, useEffect } from 'react'; // Import useState and useEffect for state management
import { campaignSteps } from '@/_tests/tours/campaignTour';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import PropertySearchModal from '@/components/reusables/tutorials/walkthroughModal';
import { columns } from '@/components/tables/employee-tables/columns';
import { EmployeeTable } from '@/components/tables/employee-tables/employee-table';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/_utils/kanban/utils';
import { mockUserProfile } from '@/constants/_faker/profile/userProfile';
import { TeamMember } from '@/types/userProfile';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Employee', link: '/dashboard/employee' }
];

// Simulate server-side data fetching (or you can use getServerSideProps for actual fetching)
async function fetchEmployees(page: number, pageLimit: number) {
  const offset = (page - 1) * pageLimit;
  const res = await fetch(
    `https://api.slingacademy.com/v1/sample-data/users?offset=${offset}&limit=${pageLimit}`
  );
  const employeeRes = await res.json();
  return {
    totalUsers: employeeRes.total_users,
    employees: mockUserProfile.teamMembers, // Example from your mock data
    pageCount: Math.ceil(employeeRes.total_users / pageLimit)
  };
}

export default function EmployeePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for help modal
  const [isTourOpen, setIsTourOpen] = useState(false); // State for the tour
  const [totalUsers, setTotalUsers] = useState(0); // Total users state
  const [employees, setEmployees] = useState<TeamMember[]>([]); // Employees state
  const [pageCount, setPageCount] = useState(0); // Page count state

  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;

  useEffect(() => {
    // Fetch employees when component mounts or searchParams changes
    const loadEmployees = async () => {
      const { totalUsers, employees, pageCount } = await fetchEmployees(
        page,
        pageLimit
      );
      setTotalUsers(totalUsers);
      setEmployees(employees);
      setPageCount(pageCount);
    };

    loadEmployees();
  }, [page, pageLimit]);

  // Handlers for help modal and tour
  const handleHelpOpenModal = () => setIsHelpModalOpen(true);
  const handleHelpCloseModal = () => setIsHelpModalOpen(false);
  const handleHelpStartTour = () => setIsTourOpen(true);
  const handleHelpCloseTour = () => setIsTourOpen(false);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex w-full flex-col items-center justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          {/* Heading Component */}
          <div className="w-full text-center sm:w-auto sm:text-left">
            <Heading
              title={`Employee (${totalUsers})`}
              description="Manage employees (Server side table functionalities.)"
            />
          </div>

          {/* Help Button */}
          <div className="flex w-full justify-center sm:w-auto">
            <button
              onClick={handleHelpOpenModal}
              title="Get More help"
              className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          {/* Add New Button */}
          <div className="flex w-full justify-center sm:w-auto">
            <Link
              href={'/dashboard/employee/new'}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'flex w-full items-center justify-center sm:w-auto'
              )}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          </div>
        </div>

        <Separator />

        {/* Help Modal */}
        <PropertySearchModal
          isOpen={isHelpModalOpen}
          onClose={handleHelpCloseModal}
          videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
          title="Welcome to Employee Management"
          subtitle="Learn how to manage your employees and use the employee table effectively."
          steps={campaignSteps} // Steps for the tour
          isTourOpen={isTourOpen}
          onStartTour={handleHelpStartTour}
          onCloseTour={handleHelpCloseTour}
        />

        {/* Employee Table */}
        <EmployeeTable
          searchKey="employees"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={employees}
          pageCount={pageCount}
        />
      </div>
    </PageContainer>
  );
}
