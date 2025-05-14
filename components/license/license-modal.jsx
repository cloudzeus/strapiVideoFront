import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export function LicenseModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>License Agreement</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm">
          <div className="space-y-2">
            <p><strong>Licensor:</strong> {process.env.NEXT_PUBLIC_SELLER_NAME}</p>
            <p><strong>Licensee:</strong> {process.env.NEXT_PUBLIC_BUYER_NAME}</p>
            <p><strong>Serial Number:</strong> {process.env.NEXT_PUBLIC_SERIAL_NUMBER}</p>
            <p><strong>Activation Date:</strong> {process.env.NEXT_PUBLIC_ACTIVATION_DATE}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">1. License Scope</h3>
            <p>This license grants {process.env.NEXT_PUBLIC_BUYER_NAME} a non-exclusive, non-transferable right to use the software MENTAL CRM (customers Relation Managment) provided by MENTAL INFORMATICS under the following terms:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The software is for internal use only.</li>
              <li>Reproduction, distribution, or transfer of the license to third parties is prohibited.</li>
              <li>Modification or reverse engineering is not permitted.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">2. Duration & Termination</h3>
            <p>This license is valid from {process.env.NEXT_PUBLIC_ACTIVATION_DATE} until is violated, or revoked by {process.env.NEXT_PUBLIC_SELLER}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">3. Support & Updates</h3>
            <p>{process.env.NEXT_PUBLIC_SELLER} may provide support and updates based on its policy.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">4. Liability Limitation</h3>
            <p>{process.env.NEXT_PUBLIC_SELLER} is not responsible for any direct or indirect damages resulting from software usage.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 