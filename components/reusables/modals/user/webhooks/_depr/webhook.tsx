// "use client";

// import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
// import { useModalStore } from "@/lib/stores/dashboard";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import WebhookUrlInput from "../WebhookUrlInput";
// import WebhookPayloadSection from "../WebhookPayloadSection";
// import WebhookHistory from "../WebhookHistory";
// import WebhookModalActions from "../WebhookModalActions";
// import type { WebhookEntryType } from "../WebhookHistory";


// // Example webhook history data
// const webhookHistory: WebhookEntryType[] = [
//   {
//     date: "2023-09-12",
//     payload: {
//       phone: "0000000000",
//       email: "test@example.com",
//       social_media: {
//         facebook: "https://facebook.com/example",
//         linkedin: "https://linkedin.com/in/example",
//         instagram: "https://instagram.com/example",
//         twitter: "https://twitter.com/example",
//       },
//       address: {
//         zip: "00000",
//         city: "Test City",
//         state: "Test State",
//         street: "Test Street",
//       },
//       summary: "Summary from AI Bot",
//       list_name: "List Name",
//       name_full: "Full Name",
//       name_last: "Last Name",
//       name_first: "First Name",
//       webhook_type: "lead_created",
//     },
//   },
//   // Add more entries as needed
// ];

// // Custom Modal Component
// const Modal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
// }> = ({ isOpen, onClose, children }) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
//         <button
//           onClick={onClose}
//           type="button"
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth="2"
//             stroke="currentColor"
//             className="h-6 w-6"
//             aria-hidden="true"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// };

// export const WebhookModal: React.FC = () => {
//   const { isWebhookModalOpen, closeWebhookModal } = useModalStore();
//   const [webhookUrl, setWebhookUrl] = useState(
//     mockUserProfile.companyInfo.webhook,
//   );
//   const [webhookPayload] = useState(`{
//   "phone": "0000000000",
//   "email": "test@example.com",
//   "social_media": {
//     "facebook": "https://facebook.com/example",
//     "linkedin": "https://linkedin.com/in/example",
//     "instagram": "https://instagram.com/example",
//     "twitter": "https://twitter.com/example"
//   },
//   "address": {
//     "zip": "00000",
//     "city": "Test City",
//     "state": "Test State",
//     "street": "Test Street"
//   },
//   "summary": "Summary from AI Bot",
//   "list_name": "List Name",
//   "name_full": "Full Name",
//   "name_last": "Last Name",
//   "name_first": "First Name",
//   "webhook_type": "lead_created",
// }`);

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(webhookPayload);
//     toast("Payload copied to clipboard!");
//   };

//   const handleTestWebhook = () => {
//     console.warn("Testing Webhook URL:", webhookUrl);
//     console.warn("Testing Webhook Payload:", webhookPayload);
//   };

//   const handleSaveWebhook = () => {
//     console.warn("Webhook saved:", { webhookUrl });
//     closeWebhookModal();
//   };

//   return (
//     <Modal isOpen={isWebhookModalOpen} onClose={closeWebhookModal}>
//       <div className="mt-4">
//         <h3 className="font-medium text-lg dark:text-gray-200">Webhook</h3>
//         <p className="text-muted-foreground text-sm dark:text-gray-400">
//           Call a webhook when you get a new lead.
//         </p>
//         <WebhookUrlInput
//           webhookUrl={webhookUrl}
//           setWebhookUrl={setWebhookUrl}
//           placeholder={mockUserProfile.companyInfo.webhook}
//           className="dark:bg-gray-800 dark:text-gray-200"
//         />
//         <WebhookPayloadSection
//           webhookPayload={webhookPayload}
//           onCopy={copyToClipboard}
//         />
//       </div>
//       <WebhookHistory webhookHistory={webhookHistory} />
//       <WebhookModalActions
//         onCancel={closeWebhookModal}
//         onTest={handleTestWebhook}
//         onSave={handleSaveWebhook}
//       />
//     </Modal>
//   );
// 						Webhook Payload
// 					</label>
// 					<div className="relative">
// 						<Textarea
// 							rows=8
// 							value=webhookPayload
// 							readOnly
// 							className="max-w-full overflow-x-auto dark:bg-gray-800 dark:text-gray-200" // Dark mode styling and horizontal scroll
// 						/>
// 						<Button
// 							onClick={copyToClipboard}
// 							variant="ghost"
// 							className="absolute top-2 right-2"
// 							size="icon"
// 						>
// 							<ClipboardCopy className="h-5 w-5 text-gray-500 dark:text-gray-300" />
// 						</Button>
// 					</div>
// 				</div>
// 			</div>
// 			<div className="mt-6">
// 				<h3 className="font-medium text-lg dark:text-gray-200">
// 					Webhook History
// 				</h3>
// 				<Separator className="my-2 dark:border-gray-600" />webhookHistory.length === 0 ? (
// 					<div className="flex h-32 flex-col items-center justify-center">
// 						<FileSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
// 						<p className="mt-2 text-gray-500 dark:text-gray-400">
// 							No webhook history available
// 						</p>
// 					</div>
// 				) : (
// 					<div className="max-h-64 space-y-4 overflow-y-auto">
// 						{webhookHistory.map((entry) => (
// 							<div
// 								key={entry.date + entry.payload}
// 								className="rounded-lg border p-4 dark:border-gray-600"
// 							>
// 								<p className="text-sm dark:text-gray-200">
// 									Webhook sent on {entry.date} with payload:
// 								</p>
// 								<pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
// 									{JSON.stringify(entry.payload, null, 2)}
// 								</pre>
// 							</div>
// 						))}
// 					</div>
// 				)
// 			</div>
// 			<div className="mt-6 flex justify-end gap-4">
// 				<Button variant="outline" onClick=closeWebhookModal>
// 					Cancel
// 				</Button>
// 				<Button variant="secondary" onClick=handleTestWebhook>
// 					Test
// 				</Button>
// 				<Button className="bg-blue-600 text-white" onClick=handleSaveWebhook>
// 					Save
// 				</Button>
// 			</div>
// 		</Modal>
// 	);
// };
