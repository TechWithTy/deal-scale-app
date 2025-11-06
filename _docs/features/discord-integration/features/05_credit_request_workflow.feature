Feature: Credit Request and Approval Workflow
  As a DealScale user
  I want to request additional credits via Discord or web
  So that I can continue using DealScale features when I run low

  Background:
    Given I have a DealScale account with linked Discord
    And the credit request system is operational
    And there are admin users who can approve requests

  # Requesting credits

  Scenario: Submit AI credit request via Discord
    Given I have 5 AI credits remaining
    When I execute "/request type:ai amount:50 reason:Launching new campaign"
    Then a credit request should be created with status "pending"
    And I should see request confirmation with ID #12345
    And the request should be stored in the database with:
      | Field              | Value                           |
      | user_id            | {my_user_id}                    |
      | credit_type        | ai                              |
      | amount             | 50                              |
      | reason             | Launching new campaign          |
      | status             | pending                         |
      | requested_via      | discord                         |
      | discord_message_id | {message_id}                    |
    And an admin notification should be posted

  Scenario: Submit lead credit request via web interface
    Given I am on the DealScale dashboard
    And I have 10 lead credits remaining
    When I click "Request Credits"
    And I select "Lead Credits"
    And I enter amount "100"
    And I enter reason "Large property investment list"
    And I click "Submit Request"
    Then I should see "Request submitted successfully"
    And the request should appear in "My Requests" section with status "Pending"

  Scenario: Request multiple credit types separately
    Given I need both AI and lead credits
    When I submit a request for 25 AI credits
    And I submit a separate request for 100 lead credits
    Then two separate requests should be created
    And each should have its own tracking ID
    And admins should see both requests in the approval queue

  Scenario: View my pending credit requests
    Given I have submitted 3 credit requests
    And 1 is approved, 1 is pending, 1 is rejected
    When I navigate to "My Credit Requests" page
    Then I should see all 3 requests with their statuses:
      | Request ID | Type  | Amount | Status   | Date       |
      | #12345     | AI    | 25     | Approved | 2025-11-05 |
      | #12346     | Lead  | 50     | Pending  | 2025-11-06 |
      | #12347     | AI    | 100    | Rejected | 2025-11-04 |

  Scenario: Cancel a pending credit request
    Given I submitted request #12346 for 50 lead credits
    And the status is "pending"
    When I click "Cancel Request" on request #12346
    Then the status should change to "cancelled"
    And I should see "Request cancelled successfully"
    And the admin notification should be updated
    And no credits should be granted

  # Admin approval workflow

  Scenario: Admin approves credit request via web dashboard
    Given I am an admin user
    And there is a pending request #12345 for 25 AI credits
    When I navigate to the admin credit requests queue
    And I click "Approve" on request #12345
    And I optionally add note "Approved - active customer"
    And I confirm the approval
    Then the request status should change to "approved"
    And 25 AI credits should be added to the user's balance
    And the user should receive a Discord DM:
      """
      ✅ Credit Request Approved!
      Your request for 25 AI credits has been approved.
      Request ID: #12345
      New balance: 30 AI credits
      Admin note: Approved - active customer
      """
    And the approval should be logged in the audit trail

  Scenario: Admin rejects credit request with reason
    Given I am an admin user
    And there is a pending request #12346 for 500 lead credits
    When I click "Reject" on request #12346
    And I enter rejection reason "Amount exceeds monthly limit"
    And I confirm the rejection
    Then the request status should change to "rejected"
    And no credits should be added to the user
    And the user should receive a Discord DM:
      """
      ❌ Credit Request Declined
      Your request for 500 lead credits was not approved.
      Request ID: #12346
      Reason: Amount exceeds monthly limit
      Please contact support if you have questions.
      """

  Scenario: Bulk approve multiple credit requests
    Given I am an admin user
    And there are 10 pending requests in the queue
    When I select 5 requests using checkboxes
    And I click "Bulk Approve"
    Then all 5 requests should be approved simultaneously
    And credits should be added to respective users
    And each user should receive an approval notification
    And the operation should complete within 10 seconds

  Scenario: Admin approval with custom credit amount
    Given I am an admin user
    And user requested 100 AI credits
    When I approve the request but change amount to 50
    And I add note "Approved partial amount"
    Then 50 AI credits should be granted (not 100)
    And the user should be notified of the modified amount

  Scenario: Request requires additional information
    Given I am an admin reviewing request #12347
    When I click "Request More Info"
    And I enter "Please provide campaign details"
    Then the user should receive a notification
    And the request status should be "pending_info"
    When the user provides additional information
    Then the status should return to "pending"
    And I should be notified to review again

  # Automated rules

  Scenario: Auto-approve small credit requests for premium users
    Given I have a premium subscription
    And I request 10 AI credits (under auto-approve threshold)
    When I submit the request
    Then the request should be automatically approved
    And credits should be added immediately
    And I should see "Request auto-approved"
    And an admin notification should still be logged

  Scenario: Flag suspicious credit requests
    Given a user requests 1000 AI credits
    And their account is only 2 days old
    And they've never closed a deal
    When the request is submitted
    Then it should be flagged as "requires_review"
    And a high-priority alert should be sent to admins
    And the request should not be auto-approvable

  Scenario: Rate limit on credit requests
    Given I have submitted 3 requests today
    When I attempt to submit a 4th request
    Then I should see an error:
      """
      Daily limit reached. You can submit up to 3 credit requests per day.
      Please wait until tomorrow or contact support.
      """
    And the request should not be created

  # Notifications and tracking

  Scenario: Real-time admin dashboard updates
    Given I am an admin viewing the requests dashboard
    And the page is open
    When a new credit request is submitted by a user
    Then the dashboard should update in real-time
    And a notification badge should appear
    And the new request should be highlighted

  Scenario: Email notification for large requests
    Given I am an admin
    When a user requests more than 500 credits
    Then I should receive an email notification
    And the email should include:
      | Field         | Content                          |
      | Subject       | High-Value Credit Request #12345 |
      | User          | {username} - {email}             |
      | Amount        | 500 AI credits                   |
      | Reason        | {user_provided_reason}           |
      | Approve Link  | Direct link to approve           |

  Scenario: Track credit request metrics
    Given I am an admin viewing analytics
    When I navigate to "Credit Requests" analytics
    Then I should see metrics:
      | Metric                          | Value  |
      | Total requests this month       | 234    |
      | Approval rate                   | 87%    |
      | Average approval time           | 2.5h   |
      | Most requested credit type      | AI     |
      | Total credits granted           | 12,500 |

  # Edge cases

  Scenario: Request submitted while offline
    Given I am on Discord with poor internet connection
    When I execute "/request type:ai amount:25"
    And my connection drops before completion
    Then Discord should retry the command
    Or I should see "Command failed - please try again"
    And no duplicate requests should be created

  Scenario: Credits granted but notification fails
    Given my request #12345 is approved
    When the system grants credits successfully
    But the Discord notification fails to send
    Then the credits should still be added
    And the failure should be logged
    And a retry should be attempted
    And I should see the credits in my dashboard

  Scenario: User deleted while request is pending
    Given request #12345 is pending for user "DeletedUser"
    When the user account is deleted
    Then pending requests should be automatically cancelled
    And admins should be notified
    And the requests should be archived

  Scenario: Audit trail for all credit operations
    Given I am an admin or auditor
    When I view the credit audit log
    Then I should see complete history:
      | Timestamp  | User    | Action            | Amount | Old Balance | New Balance | Approved By |
      | 2025-11-06 | User123 | Request Submitted | +50    | 10          | 10          | -           |
      | 2025-11-06 | User123 | Request Approved  | +50    | 10          | 60          | Admin1      |
      | 2025-11-06 | User123 | Credits Used      | -5     | 60          | 55          | System      |

  Scenario: Request approval via Discord bot command (admin)
    Given I am an admin with special permissions
    And I am in the #admin-approvals channel
    When a new request notification appears
    And I react with ✅ emoji or type "/approve #12345"
    Then the request should be approved
    And credits should be granted
    And confirmation should be posted in the channel

  Scenario: Escalate old pending requests
    Given a request has been pending for 48 hours
    When the escalation cron job runs
    Then senior admins should be notified
    And the request should be marked as "escalated"
    And it should appear at the top of the queue

