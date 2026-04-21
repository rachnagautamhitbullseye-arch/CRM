import Papa from 'papaparse'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function UploadLeads() {
  const [userId, setUserId] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const leads = results.data.map(row => ({
          name: row.name,
          company: row.company,
          status: 'New',
          assigned_to: userId
        }))

        await supabase.from('leads').insert(leads)
        alert('Uploaded!')
      }
    })
  }

  return (
    <AdminLayout>
      <h2>Upload Leads</h2>

      <input
        placeholder="User ID"
        onChange={(e) => setUserId(e.target.value)}
      />

      <input type="file" accept=".csv" onChange={handleFile} />
    </AdminLayout>
  )
}