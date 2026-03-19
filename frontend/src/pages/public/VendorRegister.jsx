import { useState } from "react"
import api from "../../services/api"

export default function VendorRegister() {

  const [form, setForm] = useState({})
  const [file, setFile] = useState(null)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async e => {
    e.preventDefault()

    const data = new FormData()
    Object.keys(form).forEach(k => data.append(k, form[k]))
    data.append("document", file)

    await api.post("/vendors/register", data)

    alert("Registration submitted. Wait for approval.")
  }

  return (
    <div>
      <h2>Vendor Registration</h2>

      <form onSubmit={submit}>
        <input name="companyName" placeholder="Company Name" onChange={handleChange} />
        <input name="contactPerson" placeholder="Contact Person" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="serviceType" placeholder="Service Type" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <button>Register</button>
      </form>
    </div>
  )
}
