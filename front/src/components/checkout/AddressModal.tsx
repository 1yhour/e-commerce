'use client'

import { useState } from 'react'
import { X, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from '@/lib/axios'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddressModal({ onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    city: '',
    country: 'Cambodia',
    is_default: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.post('/addresses', formData)
      toast.success('Address added successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save address'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-medium text-stone-900">Add New Address</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
              Address Label (e.g. Home, Office)
            </label>
            <input
              required
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-stone-900 transition-all"
              placeholder="Home"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
              Street Address
            </label>
            <input
              required
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-stone-900 transition-all"
              placeholder="123 Street Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
                City
              </label>
              <input
                required
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-stone-900 transition-all"
                placeholder="Phnom Penh"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1.5 ml-1">
                Country
              </label>
              <input
                required
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-stone-900 transition-all"
                placeholder="Cambodia"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 rounded-none border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label htmlFor="is_default" className="text-xs text-stone-600">
              Set as default shipping address
            </label>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full rounded-full py-6 h-auto text-base shadow-lg shadow-stone-200"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
