"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { toast } from "sonner"

export default function Afm2Info({ vatNumber, onDataReceived }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleVatLookup = async () => {
    if (!vatNumber) {
      toast.error("Please enter a VAT number")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/vat-lookup?vatNumber=${vatNumber}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch VAT information")
      }

      console.log("Raw VAT data:", data)

      // Map the API response fields to the correct form fields
      const mappedData = {
        name: data.onomasia || "", // Full company name
        commercialTitle: data.commer_title || "", // Commercial title
        address: `${data.postal_address || ""} ${data.postal_address_no || ""}`.trim(),
        zip: data.postal_zip_code || "",
        city: data.postal_area_description || "",
        irsOffice: data.doy_descr || "",
        vatNumber: data.afm || vatNumber,
        legalStatus: data.legal_status_descr || "",
        registrationDate: data.regist_date || "",
        isActive: data.deactivation_flag === "1",
        status: data.deactivation_flag_descr || "",
        businessType: data.firm_flag_descr || "",
        vatSystem: data.normal_vat_system_flag === "Y" ? "Normal" : "Special"
      }

      console.log("Mapped VAT data:", mappedData)
      onDataReceived(mappedData)
      toast.success("VAT information retrieved successfully")
    } catch (error) {
      console.error("Error fetching VAT information:", error)
      toast.error(error.message || "Failed to fetch VAT information")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-8 w-8"
      onClick={handleVatLookup}
      disabled={isLoading}
    >
      <Search className="h-4 w-4" />
    </Button>
  )
} 