
import React, { useState, useEffect } from 'react';
import leadService, { Lead, CreateLeadData, UpdateLeadData } from '../services/leadsService';
import LeadForm from './LeadForm';

const Leads: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await leadService.getLeads();
        setLeads(data);
      } catch (err) {
        setError('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead =>
    lead.full_name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    lead.company.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    lead.position.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSaveLead = async (leadData: CreateLeadData | UpdateLeadData) => {
    try {
      if (editingLead) {
        const updatedLead = await leadService.updateLead(editingLead.id, leadData as UpdateLeadData);
        setLeads(leads.map(lead => (lead.id === editingLead.id ? updatedLead : lead)));
      } else {
        const newLead = await leadService.createLead(leadData as CreateLeadData);
        setLeads([...leads, newLead]);
      }
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (err) {
      setError('Failed to save lead');
    }
  };

  const handleDeleteLead = async (id: number) => {
    try {
      await leadService.deleteLead(id);
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      setError('Failed to delete lead');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading leads...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold mb-4">Leads</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Create Lead
          </button>
        </div>
      </div>
      <LeadForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        lead={editingLead}
      />
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Full Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Followers</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Connections</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Education</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Profile</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{lead.full_name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.position}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.company}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.location}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.followers}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.connections}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.education}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a href={lead.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View Profile
                        </a>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => { setEditingLead(lead); setIsModalOpen(true); }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
