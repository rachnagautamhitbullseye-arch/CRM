import Papa from 'papaparse'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import toast from 'react-hot-toast'
import { Upload, UserCheck } from 'lucide-react'

export default function UploadLeads() {
  const [users, setUsers] = useState([])
  const [assignedTo, setAssignedTo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name')
    setUsers(data || [])
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!assignedTo) {
      toast.error('Please select a user to assign leads to.')
      e.target.value = ''
      return
    }

    setFileName(file.name)
    setUploading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const leads = results.data.map(row => ({
          name: row.name || row.Name || '',
          company: row.company || row.Company || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          status: 'New',
          assigned_to: assignedTo,
        })).filter(l => l.name)

        if (leads.length === 0) {
          toast.error('No valid leads found in CSV. Make sure it has a "name" column.')
          setUploading(false)
          return
        }

        const { error } = await supabase.from('leads').insert(leads)

        if (error) {
          toast.error(`Upload failed: ${error.message}`)
        } else {
          toast.success(`${leads.length} lead${leads.length > 1 ? 's' : ''} uploaded successfully!`)
          setFileName('')
          e.target.value = ''
        }

        setUploading(false)
      }
    })
  }

  return (
    <AdminLayout>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Upload Leads</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        Bulk import leads from a CSV file and assign them to a team member.
      </p>

      <div className="card" style={{ maxWidth: 500 }}>

        {/* Assign To Dropdown */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <UserCheck size={14} />
            Assign leads to
          </label>
          <select
            className="input"
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
          >
            <option value="">— Select a team member —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Upload size={14} />
            CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            disabled={uploading}
            className="input"
            style={{ cursor: 'pointer' }}
          />
          {fileName && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              📄 {fileName}
            </p>
          )}
        </div>

        {uploading && (
          <p style={{ fontSize: 13, color: 'var(--primary)', marginTop: 8 }}>
            ⏳ Uploading leads, please wait...
          </p>
        )}

        {/* CSV Format Hint */}
        <div style={{
          marginTop: 20,
          padding: '12px 14px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.7
        }}>
          <strong style={{ color: 'var(--text)' }}>Expected CSV columns:</strong><br />
          <code>name, company, email, phone</code><br />
          The <code>name</code> column is required. All others are optional.
        </div>

      </div>
    </AdminLayout>
  )
}