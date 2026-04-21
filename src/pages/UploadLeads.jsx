// src/pages/UploadLeads.jsx

import Papa from 'papaparse'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

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
        alert('Leads uploaded!')
      }
    })
  }

  return (
    <div>
      <h2>Upload Leads (CSV)</h2>

      <input
        placeholder="User ID"
        onChange={(e) => setUserId(e.target.value)}
      />

      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  )
}