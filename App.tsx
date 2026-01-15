
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import FormSelector from './pages/FormSelector';
import FormMissingSalary from './pages/FormMissingSalary';
import FormUnderpaidSalary from './pages/FormUnderpaidSalary';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { Complaint, ComplaintType, ComplaintStatus, Worker } from './types';

const AppLogo = () => (
  <svg viewBox="0 0 512 301" className="h-10 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M119.1,46h6.9c17,0.9,33.8,5.9,46.9,17.1c0.2,0.2,0.3,0.5,0.1,0.7l-20.4,26c-0.2,0.2-0.4,0.3-0.7,0.1 c-13.5-8.4-37.6-15.3-51.6-6.6c-9.8,6.1-2.8,16.6,4.8,20.1c25.8,11.8,65.1,23.4,60,61c-2.2,16.5-11.8,29.5-26.1,37.8 c-15.4,8.9-35,10.3-52.2,8.1c-17.6-2.2-32.9-9.8-45.7-22.7c-0.3-0.3-0.3-0.6,0-0.9L61.3,161c0.3-0.3,0.8-0.4,1.1-0.1c0,0,0,0,0,0 c6.1,5.3,13.1,10.1,20.6,12.8c12.2,4.4,34.5,6.1,43.9-5.2c7.2-8.6-4.1-17.2-10.8-20.3C94,138.1,62.3,129.9,59.5,101 c-0.8-8.5,1-16.9,5.6-25.5C75.1,56.7,97.5,46.8,119.1,46z"/>
    <path d="M206.6,46h59.2c27.9,1.2,58.2,14.5,56.5,47.8c-2,38.7-34.3,61.3-70.7,62.1c-8.6,0.2-17.1,0.2-25.5,0 c-0.3,0-0.6,0.2-0.6,0.5l-8.1,54.3c0,0.3-0.2,0.5-0.6,0.5l-35.5-0.3c-0.3,0-0.4-0.2-0.4-0.5L206.6,46z M277.6,108.3 c6-9.9,6.8-25.7-7.6-29.3c-10.5-2.6-21-2.4-31.5-1.9c-0.4,0-0.6,0.2-0.7,0.6l-6.3,44.8c-0.1,0.4,0.1,0.6,0.6,0.7 C247.6,123.7,268.3,123.7,277.6,108.3z"/>
    <path d="M330.5,46h45.1l36,75.6c0.1,0.3,0.1,0.6-0.1,0.9L311.3,250.3c-0.2,0.3-0.5,0.4-0.9,0.4h-40.2 c-0.6,0-0.7-0.2-0.4-0.7c32.2-40.9,64.5-81.9,96.9-122.9c2.2-2.7,2.5-2.4,0.8-5.8C355.2,96.4,342.9,71.3,330.5,46z"/>
    <path d="M430.6,46H473l-55.3,68.8c-0.2,0.2-0.5,0.3-0.7,0.1c-0.1,0-0.1-0.1-0.1-0.2L402,83.5c-0.2-0.5-0.2-0.9,0.1-1.3 L430.6,46z"/>
    <path d="M415.2,130.3C415.2,130.2,415.3,130.2,415.2,130.3c0.3,0.1,0.5,0.4,0.6,0.6c12.7,26.6,25.4,53.1,38.1,79.5 c0.1,0.2,0,0.4-0.2,0.5c-0.1,0-0.1,0-0.2,0h-41.3c-0.4,0-0.6-0.2-0.8-0.5l-22.6-46c-0.1-0.3-0.1-0.6,0.1-0.8L415.2,130.3z"/>
    <path d="M22.8,222.5l36.4,0c0.2,0,0.3,0.2,0.3,0.3c0,0.1,0,0.1-0.1,0.2l-21.6,27.6c-0.1,0.1-0.2,0.1-0.3,0.1H0.7 c-0.2,0-0.3-0.1-0.3-0.3c0-0.1,0-0.2,0.1-0.2l22.1-27.6C22.6,222.6,22.7,222.5,22.8,222.5z"/>
    <path d="M128.6,222.9L107,250.6c-0.1,0.1-0.2,0.1-0.3,0.1H47.9c-0.2,0-0.3-0.2-0.3-0.3c0-0.1,0-0.1,0.1-0.2l21.6-27.6 c0.1-0.1,0.2-0.1,0.3-0.1l58.8-0.1c0.2,0,0.3,0.2,0.3,0.3C128.7,222.8,128.7,222.9,128.6,222.9z"/>
    <path d="M258.7,250.8H117.1c-0.2,0-0.4-0.1-0.4-0.3c0-0.1,0-0.2,0.1-0.2l21.5-27.5c0.1-0.1,0.2-0.1,0.3-0.1l141.7,0 c0.2,0,0.4,0.1,0.4,0.3c0,0.1,0,0.2-0.1,0.2L259,250.6C258.9,250.7,258.8,250.8,258.7,250.8z"/>
    <path d="M349.1,228.9l-0.6,5c0,0.2,0.1,0.5,0.4,0.5c0,0,0,0,0.1,0l11.7-0.3c0.2,0,0.4,0.2,0.4,0.4c0,0,0,0,0,0.1 l-0.7,5.1c0,0.2-0.2,0.4-0.4,0.4h-12.2c-0.2,0-0.4,0.2-0.4,0.4l-0.5,3.9c0,0.2,0.1,0.4,0.4,0.5c0,0,0,0,0,0h12.1 c0.2,0,0.4,0.2,0.4,0.4c0,0,0,0,0,0.1l-0.9,5.1c0,0.2-0.2,0.4-0.4,0.4H340c-0.2,0-0.4-0.2-0.4-0.4c0,0,0,0,0-0.1l4.3-27.4 c0-0.2,0.2-0.4,0.4-0.4l18.6-0.1c0.2,0,0.4,0.2,0.4,0.4c0,0,0,0.1,0,0.1l-0.9,5.2c0,0.2-0.2,0.4-0.4,0.4h-12.4 C349.3,228.5,349.2,228.7,349.1,228.9z"/>
    <path d="M376,242.9l-6.3,7.8c-0.1,0.1-0.2,0.1-0.3,0.1h-7c-0.2,0-0.4-0.2-0.4-0.4c0-0.1,0-0.2,0.1-0.2l11.1-13.6 c0.1-0.1,0.1-0.3,0-0.4l-6.6-13.2c-0.1-0.2,0-0.4,0.2-0.5c0.1,0,0.1,0,0.2,0l7.3,0.2c0.2,0,0.3,0.1,0.4,0.2l3.3,6.9 c0.1,0.2,0.3,0.3,0.5,0.2c0.1,0,0.1-0.1,0.1-0.1l5.8-7c0.1-0.1,0.2-0.1,0.3-0.1l7.2-0.4c0.2,0,0.4,0.2,0.4,0.4c0,0.1,0,0.2-0.1,0.3 l-10.8,13.3c-0.1,0.1-0.1,0.3,0,0.4l7,13.6c0.1,0.2,0,0.4-0.2,0.5c-0.1,0-0.1,0-0.2,0h-7.3c-0.2,0-0.3-0.1-0.4-0.2l-3.8-7.6 c-0.1-0.2-0.3-0.3-0.5-0.2C376.1,242.8,376.1,242.8,376,242.9z"/>
    <path d="M450.3,244.8h12.2c0.2,0,0.4,0.2,0.4,0.4c0,0,0,0,0,0.1l-0.8,5.2c0,0.2-0.2,0.3-0.4,0.3H443 c-0.2,0-0.4-0.2-0.4-0.4c0,0,0,0,0-0.1l4.2-27.4c0-0.2,0.2-0.3,0.4-0.3l18.7-0.2c0.2,0,0.4,0.2,0.4,0.4c0,0,0,0.1,0,0.1l-0.9,5.4 c0,0.2-0.2,0.3-0.4,0.3h-12.4c-0.2,0-0.3,0.1-0.4,0.3l-0.8,5c0,0.2,0.1,0.4,0.3,0.4c0,0,0,0,0.1,0l11.9-0.2c0.2,0,0.4,0.2,0.4,0.4 c0,0,0,0,0,0l-0.6,5.2c0,0.2-0.2,0.3-0.4,0.3H451c-0.2,0-0.3,0.1-0.4,0.3l-0.7,4C449.9,244.5,450,244.7,450.3,244.8 C450.3,244.7,450.3,244.7,450.3,244.8z"/>
    <path d="M399.3,243.8l-0.9,6.3c0,0.3-0.3,0.6-0.7,0.6h-5.3c-0.3,0-0.5-0.2-0.4-0.5l4.3-27.2c0.1-0.4,0.3-0.5,0.6-0.5 c8.1-0.1,20.2-2.4,19.7,8.9c-0.4,10.3-8.2,11.7-16.7,11.8C399.6,243.3,399.3,243.5,399.3,243.8z M401.6,229.2l-1.1,7.3 c-0.1,0.3,0.1,0.5,0.4,0.5c4.8,0.1,11.3,0.3,9.2-7c-0.2-0.6-0.7-1.1-1.4-1.1l-6.1-0.5C402,228.3,401.7,228.6,401.6,229.2z"/>
    <path d="M421.5,222.7c0-0.1,0.1-0.2,0.2-0.2c6.1-0.1,18.6-2.2,19.9,6.3c0.9,5.8-1.2,10.2-6.4,13.3 c-0.3,0.2-0.3,0.4-0.2,0.6l4.2,7.5c0.2,0.3,0.1,0.5-0.3,0.5h-6c-0.4,0-0.6-0.2-0.8-0.5l-3.5-6.3c-0.6-1.1-2.1-1.6-3.2-0.9 c-0.6,0.4-1.1,1-1.2,1.7l-0.8,5.4c-0.1,0.4-0.3,0.6-0.7,0.6h-5c-0.5,0-0.7-0.2-0.6-0.7L421.5,222.7z M426.7,229l-1.2,7.7 c0,0.3,0.1,0.5,0.5,0.4c3.8-0.2,11.2,0.3,9.5-6.2c-0.8-2.9-5.9-2.6-8.2-2.4C427,228.6,426.8,228.7,426.7,229z"/>
    <path d="M467.3,244.7l1.7-2.1c0.2-0.2,0.4-0.3,0.6-0.1c2.8,1.6,5.8,3.2,9,1.8c2-0.9,2.1-3.1,0-4 c-5.3-2.5-12.7-5.2-8.4-12.8c3.6-6.3,12.8-6.1,17.9-2.4c0.3,0.2,0.4,0.5,0.1,0.8l-3,3.6c-0.2,0.3-0.5,0.3-0.8,0.2 c-2.8-1.2-6-2.8-8.6-0.3c-0.6,0.6-0.6,1.6-0.1,2.2c0.1,0.1,0.3,0.2,0.4,0.3c5.2,2.6,14.1,5.6,9.5,13.7c-4,7-14.5,6.6-19.8,1.4 c-0.2-0.2-0.3-0.5-0.1-0.7c0.2-0.5,0.5-0.9,1-1.1C467.1,244.9,467.2,244.8,467.3,244.7z"/>
    <path d="M493.9,226.9c3.6-5.8,12.6-5.4,17.6-1.9c0.3,0.2,0.4,0.5,0.1,0.8l-3.2,3.8c-0.3,0.3-0.6,0.3-0.9,0.1 c-2.2-1.5-4.5-2-7.1-1.5c-1.1,0.2-1.9,1.3-1.7,2.5c0,0.1,0,0.1,0.1,0.2c0.1,0.5,0.7,0.9,1.5,1.3c2.6,1.2,4.8,2.4,6.7,3.6 c10.8,7.4-6.6,21.7-17.8,11.2c-0.3-0.3-0.3-0.7-0.1-1l3-3.5c0.3-0.3,0.6-0.4,0.9-0.1c2.2,1.7,8.3,3.9,10,0.4c0.5-1,0.1-2.2-0.9-2.6 c0,0-0.1,0-0.1-0.1C496.5,237.7,488.9,235,493.9,226.9z"/>
  </svg>
);

const INITIAL_MASTER_WORKERS: Worker[] = [
  { opsId: 'SPX-78291', fullName: 'Budi Santoso' },
  { opsId: 'SPX-99012', fullName: 'Siti Aminah' },
  { opsId: 'SPX-11223', fullName: 'Ahmad Dahlan' },
  { opsId: 'SPX-44556', fullName: 'Citra Kirana' },
  { opsId: 'SPX-77889', fullName: 'Doni Firmansyah' },
  { opsId: 'SPX-10111', fullName: 'Fitri Handayani' },
  { opsId: 'SPX-23232', fullName: 'Gilang Ramadhan' },
  { opsId: 'SPX-45454', fullName: 'Hesti Purwadinata' },
  { opsId: 'SPX-67676', fullName: 'Indra Gunawan' },
  { opsId: 'SPX-89898', fullName: 'Joko Susilo' },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'selector' | 'form-missing' | 'form-underpaid' | 'dashboard' | 'login'>('landing');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    // Load complaints
    const savedComplaints = localStorage.getItem('spx_complaints');
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    } else {
      const dummyData: Complaint[] = [
        {
          id: 'dummy-1',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.PENDING,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          opsId: 'SPX-78291',
          fullName: 'Budi Santoso',
          whatsappNumber: '081234567890',
          bankAccountNumber: '1234567890',
          bankAccountName: 'Budi Santoso',
          bankName: 'BCA',
          period: '1-15 Oktober 2024',
          alreadyFilledLink: 'SUDAH'
        },
        {
          id: 'dummy-2',
          type: ComplaintType.UNDERPAID_SALARY,
          status: ComplaintStatus.PROCESSING,
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          opsId: 'SPX-99012',
          fullName: 'Siti Aminah',
          whatsappNumber: '089876543210',
          bankAccountNumber: '0987654321',
          bankAccountName: 'Siti Aminah',
          bankName: 'MANDIRI',
          period: '1-15 Oktober 2024',
          receivedAmount: '1212000',
          evidenceUrl: 'https://picsum.photos/seed/siti/400/300'
        },
        {
          id: 'dummy-3',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.RESOLVED,
          timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          opsId: 'SPX-11223',
          fullName: 'Ahmad Dahlan',
          whatsappNumber: '081122334455',
          bankAccountNumber: '1122334455',
          bankAccountName: 'Ahmad Dahlan',
          bankName: 'BNI',
          period: '16-30 September 2024',
          alreadyFilledLink: 'SUDAH'
        },
        {
          id: 'dummy-4',
          type: ComplaintType.UNDERPAID_SALARY,
          status: ComplaintStatus.REJECTED,
          timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          opsId: 'SPX-44556',
          fullName: 'Citra Kirana',
          whatsappNumber: '085566778899',
          bankAccountNumber: '4455667788',
          bankAccountName: 'Citra Kirana',
          bankName: 'BRI',
          period: '16-30 September 2024',
          receivedAmount: '1800000'
        },
        {
          id: 'dummy-5',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.ESCALATED,
          timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          opsId: 'SPX-77889',
          fullName: 'Doni Firmansyah',
          whatsappNumber: '087788990011',
          bankAccountNumber: '7788990011',
          bankAccountName: 'Doni Firmansyah',
          bankName: 'SEABANK',
          period: '1-15 Oktober 2024',
          alreadyFilledLink: 'BELUM'
        },
        {
          id: 'dummy-6',
          type: ComplaintType.UNDERPAID_SALARY,
          status: ComplaintStatus.PENDING,
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          opsId: 'SPX-10111',
          fullName: 'Fitri Handayani',
          whatsappNumber: '081011121314',
          bankAccountNumber: '1011121314',
          bankAccountName: 'Fitri Handayani',
          bankName: 'BCA',
          period: '1-15 Oktober 2024',
          receivedAmount: '500000',
          evidenceUrl: 'https://picsum.photos/seed/fitri/400/300'
        },
        {
          id: 'dummy-7',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.PENDING,
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          opsId: 'SPX-23232',
          fullName: 'Gilang Ramadhan',
          whatsappNumber: '082323232323',
          bankAccountNumber: '2323232323',
          bankAccountName: 'Gilang Ramadhan',
          bankName: 'MANDIRI',
          period: '1-15 Oktober 2024',
          alreadyFilledLink: 'SUDAH'
        },
        {
          id: 'dummy-8',
          type: ComplaintType.UNDERPAID_SALARY,
          status: ComplaintStatus.PROCESSING,
          timestamp: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          opsId: 'SPX-78291',
          fullName: 'Budi Santoso',
          whatsappNumber: '081234567890',
          bankAccountNumber: '1234567890',
          bankAccountName: 'Budi Santoso',
          bankName: 'BCA',
          period: '16-30 September 2024',
          receivedAmount: '1500000',
          evidenceUrl: 'https://picsum.photos/seed/budi/400/300'
        },
        {
          id: 'dummy-9',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.RESOLVED,
          timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          opsId: 'SPX-89898',
          fullName: 'Joko Susilo',
          whatsappNumber: '088989898989',
          bankAccountNumber: '8989898989',
          bankAccountName: 'Joko Susilo',
          bankName: 'BNI',
          period: '1-15 September 2024',
          alreadyFilledLink: 'SUDAH'
        },
        {
          id: 'dummy-10',
          type: ComplaintType.MISSING_SALARY,
          status: ComplaintStatus.PENDING,
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          opsId: 'SPX-44556',
          fullName: 'Citra Kirana',
          whatsappNumber: '085566778899',
          bankAccountNumber: '4455667788',
          bankAccountName: 'Citra Kirana',
          bankName: 'BRI',
          period: '1-15 Oktober 2024',
          alreadyFilledLink: 'BELUM'
        }
      ];
      setComplaints(dummyData);
      localStorage.setItem('spx_complaints', JSON.stringify(dummyData));
    }
    
    // Load workers
    const savedWorkers = localStorage.getItem('spx_workers');
    if (savedWorkers) {
        setWorkers(JSON.parse(savedWorkers));
    } else {
        setWorkers(INITIAL_MASTER_WORKERS);
        localStorage.setItem('spx_workers', JSON.stringify(INITIAL_MASTER_WORKERS));
    }
  }, []);

  const saveComplaint = (complaint: Complaint) => {
    const updated = [complaint, ...complaints];
    setComplaints(updated);
    localStorage.setItem('spx_complaints', JSON.stringify(updated));
    alert('Komplain Anda telah terkirim. Mohon tunggu proses pengecekan oleh admin.');
    setCurrentPage('landing');
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus) => {
    const updated = complaints.map(c => c.id === id ? { ...c, status } : c);
    setComplaints(updated);
    localStorage.setItem('spx_complaints', JSON.stringify(updated));
  };
  
  const handleAddWorker = (worker: Worker) => {
    const updatedWorkers = [...workers, worker];
    setWorkers(updatedWorkers);
    localStorage.setItem('spx_workers', JSON.stringify(updatedWorkers));
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    const updatedWorkers = workers.map(w => w.opsId === updatedWorker.opsId ? updatedWorker : w);
    setWorkers(updatedWorkers);
    localStorage.setItem('spx_workers', JSON.stringify(updatedWorkers));
  };

  const handleDeleteWorker = (opsId: string) => {
    const updatedWorkers = workers.filter(w => w.opsId !== opsId);
    setWorkers(updatedWorkers);
    localStorage.setItem('spx_workers', JSON.stringify(updatedWorkers));
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNext={() => setCurrentPage('selector')} />;
      case 'selector': return <FormSelector onSelect={(type) => setCurrentPage(type === ComplaintType.MISSING_SALARY ? 'form-missing' : 'form-underpaid')} onBack={() => setCurrentPage('landing')} />;
      case 'form-missing': return <FormMissingSalary workers={workers} previousComplaints={complaints} onSubmit={(data) => saveComplaint({ ...data as any, status: ComplaintStatus.PENDING })} onBack={() => setCurrentPage('selector')} />;
      case 'form-underpaid': return <FormUnderpaidSalary workers={workers} previousComplaints={complaints} onSubmit={(data) => saveComplaint({ ...data as any, status: ComplaintStatus.PENDING })} onBack={() => setCurrentPage('selector')} />;
      case 'login': return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} onBack={() => setCurrentPage('landing')} />;
      case 'dashboard': return <Dashboard 
                                  complaints={complaints} 
                                  workers={workers}
                                  onBack={() => setCurrentPage('landing')} 
                                  onUpdateStatus={updateComplaintStatus} 
                                  onAddWorker={handleAddWorker}
                                  onUpdateWorker={handleUpdateWorker}
                                  onDeleteWorker={handleDeleteWorker}
                                />;
      default: return <LandingPage onNext={() => setCurrentPage('selector')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-[#EE4D2D] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => setCurrentPage('landing')} className="flex items-center hover:opacity-80 transition-opacity">
            <AppLogo />
          </button>
          <button onClick={() => setCurrentPage('login')} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all font-medium">Akses Admin</button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">{renderPage()}</main>
      <footer className="bg-slate-100 border-t py-8 text-center text-slate-500 text-sm">
        <div className="max-w-5xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Shopee Xpress - Sistem Komplen Gaji Daily Worker</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
