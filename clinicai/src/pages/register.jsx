import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { registerPatient } from '../../contract';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    contact: '',
    address: '',
    emergency_contact: '',
    insurance_id: '',
    known_allergies: [],
    chronic_conditions: [],
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = (field, value, setInput) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...new Set([...prev[field], value.trim()])]
    }));
    setInput('');
  };

  const removeTag = (field, tag) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await registerPatient(formData);
      if (result.patient_id) {
        router.push(`/consult?patientId=${result.patient_id}`);
      }
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black antialiased overflow-x-hidden">
      <Head>
        <title>CLINICAI | PATIENT INTAKE</title>
      </Head>

      <nav className="border-b-[0.5px] border-black p-8 flex justify-between items-center transition-all bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-12">
          <Link href="/" className="text-4xl font-black uppercase tracking-tighter hover:opacity-70 transition-opacity">ClinicAI</Link>
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Registry Protocol</span>
             <span className="text-sm font-black uppercase">Form 104-B: Intake</span>
          </div>
        </div>
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest border-b-[0.5px] border-black pb-1 hover:bg-black hover:text-white transition-all px-2">Cancel Entry</Link>
      </nav>

      <main className="max-w-6xl mx-auto p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-24">
          
          {/* Section I: Identity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter border-l-4 border-black pl-4">Section I</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Primary Identity</p>
            </div>
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Full Legal Name</label>
                <input 
                  required name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full bg-white border-b-2 border-black py-4 text-3xl font-light uppercase tracking-tighter outline-none"
                  placeholder="E.G. RAMESH PATIL"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-black">Age</label>
                  <input 
                    required type="number" name="age" value={formData.age} onChange={handleInputChange}
                    className="w-full bg-white border-b-2 border-black py-4 text-3xl font-light outline-none"
                    placeholder="00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-black">Gender</label>
                  <select 
                    name="gender" value={formData.gender} onChange={handleInputChange}
                    className="w-full bg-white border-b-2 border-black py-5 text-xl font-black uppercase outline-none appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[0.5px] bg-black/10 w-full"></div>

          {/* Section II: Physiological & Connectivity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter border-l-4 border-black pl-4">Section II</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Bio & Contact</p>
            </div>
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Blood Group</label>
                <input 
                  name="blood_group" value={formData.blood_group} onChange={handleInputChange}
                  className="w-full bg-white border-b-2 border-black py-2 text-xl font-black uppercase outline-none"
                  placeholder="O+"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Contact Number</label>
                <input 
                  required name="contact" value={formData.contact} onChange={handleInputChange}
                  className="w-full bg-white border-b-2 border-black py-2 text-xl font-light outline-none"
                  placeholder="+91-0000000000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Insurance ID</label>
                <input 
                  name="insurance_id" value={formData.insurance_id} onChange={handleInputChange}
                  className="w-full bg-white border-b-2 border-black py-2 text-xl font-light uppercase outline-none"
                  placeholder="ID-9990X"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                 <label className="text-[11px] font-black uppercase tracking-widest text-black">Residential Address</label>
                 <textarea 
                  name="address" value={formData.address} onChange={handleInputChange}
                  className="w-full bg-white border-[0.5px] border-black p-4 text-sm font-light outline-none min-h-[100px]"
                  placeholder="Enter full address for medical records..."
                />
              </div>
            </div>
          </div>

          <div className="h-[0.5px] bg-black/10 w-full"></div>

          {/* Section III: Clinical Background */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter border-l-4 border-black pl-4">Section III</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Neural Context</p>
              <div className="mt-8 bg-black p-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Caution: This data directly informs the AI Safety Audit Engine.</p>
              </div>
            </div>
            <div className="lg:col-span-9 space-y-16">
              
              {/* Allergies Tagging */}
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Known Allergies</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.known_allergies.map(tag => (
                    <span key={tag} className="bg-black text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest flex items-center">
                      {tag}
                      <button type="button" onClick={() => removeTag('known_allergies', tag)} className="ml-3 hover:text-gray-400">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex border-b-2 border-black">
                  <input 
                    value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('known_allergies', allergyInput, setAllergyInput))}
                    className="flex-1 py-4 text-xl font-light uppercase tracking-tighter outline-none"
                    placeholder="Add Allergy (e.g. Penicillin)..."
                  />
                  <button 
                    type="button" onClick={() => addTag('known_allergies', allergyInput, setAllergyInput)}
                    className="px-6 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all"
                  >Add Entry</button>
                </div>
              </div>

              {/* Chronic conditions Tagging */}
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.chronic_conditions.map(tag => (
                    <span key={tag} className="border-[0.5px] border-black px-3 py-1 text-[11px] font-black uppercase tracking-widest flex items-center">
                      {tag}
                      <button type="button" onClick={() => removeTag('chronic_conditions', tag)} className="ml-3 hover:opacity-50">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex border-b-2 border-black">
                  <input 
                    value={conditionInput} onChange={(e) => setConditionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('chronic_conditions', conditionInput, setConditionInput))}
                    className="flex-1 py-4 text-xl font-light uppercase tracking-tighter outline-none"
                    placeholder="Add Condition (e.g. Type 2 Diabetes)..."
                  />
                  <button 
                    type="button" onClick={() => addTag('chronic_conditions', conditionInput, setConditionInput)}
                    className="px-6 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all"
                  >Add Entry</button>
                </div>
              </div>

            </div>
          </div>

          {/* Fixed Footer Submission */}
          <div className="sticky bottom-8 z-40 bg-white border-[0.5px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div className="hidden lg:block">
               <p className="text-[10px] font-black uppercase tracking-widest">Protocol Verification Required</p>
               <p className="text-[9px] font-light text-gray-500 uppercase tracking-widest">Ensuring session continuity with neural audit.</p>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-12 py-6 font-black uppercase tracking-[0.4em] text-sm hover:translate-x-1 hover:-translate-y-1 transition-all disabled:bg-gray-400"
            >
              {isSubmitting ? 'Recording Profile...' : 'Begin Consultation'}
            </button>
          </div>

        </form>
      </main>

      <footer className="p-24 bg-black text-white text-center">
         <h1 className="text-9xl font-black uppercase tracking-tighter leading-none opacity-20">ClinicAI</h1>
         <p className="text-[10px] font-black uppercase tracking-[0.8em] mt-8 opacity-40">Neural Integrated Medical Registry</p>
      </footer>
    </div>
  );
}
