import { leadExcelColumns } from "@/components/tables/lead-tables/LeadColumns";
import { Button } from "@/components/ui/button";
import { exportLeadsToExcel } from "@/lib/_utils/files/loopDownload/leadExports";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function EmailDownloadCell({
	row,
}: CellContext<LeadTypeGlobal, unknown>) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() =>
				exportLeadsToExcel(
					[row.original], // data
					leadExcelColumns, // columns
					"LeadsExport", // filename
				)
			}
		>
			Export
		</Button>
	);
}
