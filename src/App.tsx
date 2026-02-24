import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Image as ImageIcon, 
  CheckCircle2, 
  Download, 
  Mail, 
  Trash2,
  Loader2,
  Building2,
  ArrowRight,
  History,
  Plus,
  Wand2,
  Check,
  X,
  User,
  Briefcase,
  Layers,
  Globe,
  MapPin,
  Palette
} from "lucide-react";
import { CompanyInfo, EmployeeInfo, ReportData, RecipientInfo } from "./types";
import { cn, getInitials, fileToBase64, extractDominantColor } from "./utils/uiUtils";
import { extractTextFromImage, generateStructuredReport, polishText } from "./services/geminiService";
import { generateReportPDF, copyEmailDraft } from "./utils/reportUtils";
import { format } from "date-fns";

// --- Base Components ---

const Button = ({ 
  children, 
  variant = "primary", 
  className, 
  isLoading, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient", isLoading?: boolean }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:text-slate-900",
    gradient: "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:shadow-lg hover:scale-[1.02]"
  };

  return (
    <button 
      className={cn(
        "px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm",
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 md:p-10", className)}>
    {children}
  </div>
);

const Input = ({ label, error, id, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string, icon?: any }) => {
  const inputId = id || React.useId();
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && <label htmlFor={inputId} className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 cursor-pointer">{label}</label>}
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />}
        <input 
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-sm",
            Icon && "pl-11",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

const TextArea = ({ label, error, id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string }) => {
  const inputId = id || React.useId();
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && <label htmlFor={inputId} className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 cursor-pointer">{label}</label>}
      <textarea 
        id={inputId}
        className={cn(
          "w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-sm min-h-[120px] resize-none",
          error && "border-red-500 focus:ring-red-500/10 focus:border-red-500"
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

// --- Sub-views ---

const LandingView = ({ onStart, onViewHistory }: { onStart: () => void, onViewHistory: () => void }) => (
  <div className="max-w-5xl mx-auto py-32 px-6 text-center space-y-16">
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mx-auto">
        <Sparkles className="w-3 h-3 text-emerald-500" />
        The Future of Team Documentation
      </div>
      <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight leading-[0.95] bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500">
        Professional Reports. <br />
        <span className="text-slate-300">Generated in Seconds.</span>
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
        Empower your team with AI-driven daily summaries. 
        Transform raw notes, screenshots, or voice memos into structured, branded documents.
      </p>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ delay: 0.4, duration: 0.8 }} 
      className="flex flex-wrap items-center justify-center gap-6"
    >
      <Button onClick={onStart} variant="gradient" className="h-16 px-12 rounded-2xl text-lg group">
        Start New Report
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
      <Button variant="outline" onClick={onViewHistory} className="h-16 px-12 rounded-2xl text-lg bg-white">
        View History
      </Button>
    </motion.div>

    <div className="pt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
      {[
        { title: "AI Intelligence", desc: "Advanced LLMs structure your chaotic notes into professional corporate schemas.", icon: Wand2 },
        { title: "Visual Recognition", desc: "OCR technology extracts text from handwritten journals or whiteboard photos.", icon: ImageIcon },
        { title: "Brand Alignment", desc: "Automatic color detection and logo integration for a billion-dollar aesthetic.", icon: Palette }
      ].map((item, i) => (
        <div key={i} className="space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
            <item.icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider">{item.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const HistoryView = ({ history, onBack, onSelect }: { history: any[], onBack: () => void, onSelect: (item: any) => void }) => (
  <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report Archive</h2>
        <p className="text-sm text-slate-400 font-medium">Your recently generated documentation</p>
      </div>
      <Button variant="outline" onClick={onBack} className="rounded-full px-6">Back to Home</Button>
    </div>

    {history.length === 0 ? (
      <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No history available</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(item)}
            className="p-6 rounded-3xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg overflow-hidden">
                {item.company.logo ? <img src={item.company.logo} className="w-full h-full object-contain" /> : getInitials(item.company.name)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{item.report.employee.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{format(new Date(item.report.date), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

const SuccessPopup = ({ onDownload, onEmail, onReset, onClose }: { onDownload: () => void, onEmail: () => void, onReset: () => void, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
  >
    <Card className="max-w-md w-full text-center space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400" />
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full transition-colors z-10"
      >
        <X className="w-5 h-5 text-slate-400" />
      </button>

      <div className="space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Successfully Generated</h3>
          <p className="text-sm text-slate-500 font-medium">Your professional work report is ready.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button onClick={onDownload} variant="gradient" className="h-14 rounded-2xl">
          <Download className="w-5 h-5" /> Download PDF
        </Button>
        <Button onClick={onEmail} variant="outline" className="h-14 rounded-2xl">
          <Mail className="w-5 h-5" /> Generate Email
        </Button>
        <Button onClick={onReset} variant="ghost" className="h-12 rounded-2xl">
          Create Another Report
        </Button>
      </div>
    </Card>
  </motion.div>
);

const EmailModal = ({ report, onClose }: { report: ReportData, onClose: () => void }) => {
  const [recipient, setRecipient] = useState<RecipientInfo>({ name: "", role: "", email: "" });
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string, body: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation for email based on report
    setTimeout(() => {
      const subject = `Daily Work Report - ${report.employee.name} - ${format(new Date(report.date), "MMM d, yyyy")}`;
      const body = `Dear ${recipient.name || "Team"},\n\nI am submitting my daily work report for ${format(new Date(report.date), "PPP")}.\n\nSUMMARY:\n${report.summary_bullets.map(b => `• ${b}`).join("\n")}\n\nTASKS:\n${report.tasks.map(t => `• [${t.status}] ${t.task}`).join("\n")}\n\nRegards,\n${report.employee.name}\n${report.employee.role || ""}`;
      setGeneratedEmail({ subject, body });
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    alert("Email copied to clipboard!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
    >
      <Card className="max-w-2xl w-full space-y-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Generate Email</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {!generatedEmail ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 font-medium">Enter recipient details to customize the email draft.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Recipient Name" placeholder="e.g. Sarah Jenkins" value={recipient.name} onChange={e => setRecipient({...recipient, name: e.target.value})} icon={User} />
              <Input label="Recipient Designation" placeholder="e.g. Project Manager" value={recipient.role} onChange={e => setRecipient({...recipient, role: e.target.value})} icon={Briefcase} />
            </div>
            <Input label="Recipient Email" placeholder="e.g. sarah@company.com" value={recipient.email} onChange={e => setRecipient({...recipient, email: e.target.value})} icon={Mail} />
            <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full h-14 rounded-2xl" variant="gradient">Generate Draft</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                <p className="text-sm font-bold text-slate-900">{generatedEmail.subject}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Body</p>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{generatedEmail.body}</pre>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setGeneratedEmail(null)} variant="outline" className="flex-1 h-14 rounded-2xl">Back</Button>
              <Button onClick={copyToClipboard} variant="gradient" className="flex-1 h-14 rounded-2xl">Copy Email</Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

const WizardView = ({ 
  step, 
  setStep, 
  companyInfo, 
  setCompanyInfo, 
  employeeInfo, 
  setEmployeeInfo, 
  textNotes, 
  setTextNotes, 
  imagePreview, 
  onImageUpload, 
  onGenerate, 
  reportData, 
  onDownload,
  onReset,
  isLoading,
  loadingMessage,
  onEmail,
  onPolish,
  isPolishing,
  setReportData,
  onFinalize
}: { 
  step: number, 
  setStep: (s: number) => void,
  companyInfo: CompanyInfo,
  setCompanyInfo: (c: CompanyInfo) => void,
  employeeInfo: EmployeeInfo,
  setEmployeeInfo: (e: EmployeeInfo) => void,
  textNotes: string,
  setTextNotes: (t: string) => void,
  imagePreview: string | null,
  onImageUpload: (file: File | null) => void,
  onGenerate: () => void,
  reportData: ReportData | null,
  setReportData: (r: ReportData | null) => void,
  onDownload: () => void,
  onReset: () => void,
  isLoading: boolean,
  loadingMessage: string,
  onEmail: () => void,
  onPolish: () => void,
  isPolishing: boolean,
  onFinalize: () => void
}) => {
  const steps = [
    { id: 1, title: "Organization", icon: Building2 },
    { id: 2, title: "Personal", icon: User },
    { id: 3, title: "Documentation", icon: Layers },
    { id: 4, title: "Review", icon: CheckCircle2 }
  ];

  const onLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const dominantColor = await extractDominantColor(base64);
      setCompanyInfo({ ...companyInfo, logo: base64, brandColor: dominantColor });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10" />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-3 bg-[#fafafa] px-4">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
              step >= s.id || (s.id === 3 && step === 3.5) ? "bg-slate-900 text-white scale-110" : "bg-white text-slate-300 border border-slate-100"
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", step >= s.id || (s.id === 3 && step === 3.5) ? "text-slate-900" : "text-slate-300")}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-8 text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-slate-900 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI is Processing</h3>
              <p className="text-sm text-slate-500 font-medium">{loadingMessage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {step === 1 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-slate-50/50 border border-slate-100">
                  <div className="w-32 h-32 rounded-[32px] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group transition-all hover:border-slate-900 hover:shadow-xl">
                    {companyInfo.logo ? (
                      <img src={companyInfo.logo} className="w-full h-full object-contain p-4" alt="Logo" />
                    ) : (
                      <div className="text-center space-y-1">
                        <Plus className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Logo</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={onLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900">Organization Branding</h4>
                      <p className="text-sm text-slate-500 font-medium">Upload logo (400x200px PNG recommended) to sync brand colors.</p>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: companyInfo.brandColor }} />
                      <Input 
                        placeholder="#000000" 
                        value={companyInfo.brandColor} 
                        onChange={e => setCompanyInfo({ ...companyInfo, brandColor: e.target.value })} 
                        className="w-32 h-10 px-3 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Company Name" 
                    placeholder="e.g. Digitalliyo" 
                    value={companyInfo.name} 
                    onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })} 
                    icon={Building2}
                  />
                  <Input 
                    label="Website URL" 
                    placeholder="e.g. www.digitalliyo.com" 
                    value={companyInfo.website} 
                    onChange={e => setCompanyInfo({ ...companyInfo, website: e.target.value })} 
                    icon={Globe}
                  />
                </div>
                <Input 
                  label="Office Address" 
                  placeholder="e.g. Silicon Valley, CA" 
                  value={companyInfo.address} 
                  onChange={e => setCompanyInfo({ ...companyInfo, address: e.target.value })} 
                  icon={MapPin}
                />
                <Button onClick={() => setStep(2)} disabled={!companyInfo.name} variant="gradient" className="w-full h-16 rounded-2xl text-lg">Continue to Personal</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    placeholder="e.g. Habib Nayeem" 
                    value={employeeInfo.name} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, name: e.target.value })} 
                    icon={User}
                  />
                  <Input 
                    label="Work Email" 
                    placeholder="e.g. habib@digitalliyo.com" 
                    value={employeeInfo.email} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, email: e.target.value })} 
                    icon={Mail}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Designation" 
                    placeholder="e.g. Senior UI Designer" 
                    value={employeeInfo.role} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, role: e.target.value })} 
                    icon={Briefcase}
                  />
                  <Input 
                    label="Department" 
                    placeholder="e.g. Product Design" 
                    value={employeeInfo.department} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, department: e.target.value })} 
                    icon={Layers}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input 
                    label="Reporting Date" 
                    type="date" 
                    value={employeeInfo.date} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, date: e.target.value })} 
                  />
                  <Input 
                    label="Operational Hours" 
                    placeholder="e.g. 09:00 AM - 06:00 PM" 
                    value={employeeInfo.workingHours} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, workingHours: e.target.value })} 
                  />
                  <Input 
                    label="Project Name" 
                    placeholder="e.g. SaaS Dashboard" 
                    value={employeeInfo.project} 
                    onChange={e => setEmployeeInfo({ ...employeeInfo, project: e.target.value })} 
                  />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl">Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!employeeInfo.name} variant="gradient" className="flex-1 h-16 rounded-2xl">Continue to Documentation</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <TextArea 
                    label="Daily Work Documentation" 
                    placeholder="Describe your accomplishments, challenges, and plans for tomorrow..." 
                    value={textNotes} 
                    onChange={e => setTextNotes(e.target.value)} 
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={onPolish} 
                      disabled={!textNotes || isPolishing}
                      className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 disabled:opacity-30 transition-opacity"
                    >
                      {isPolishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Polish with AI
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pro Tip</p>
                      <p className="text-xs text-blue-700 leading-relaxed font-medium">
                        Include completed tasks, pending items, challenges faced, and your plan for tomorrow. 
                        Empty fields will be automatically excluded from the final PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className={cn(
                    "border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-500",
                    imagePreview ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-900 hover:bg-white"
                  )}>
                    {imagePreview ? (
                      <div className="space-y-6">
                        <img src={imagePreview} className="max-h-64 mx-auto rounded-2xl shadow-2xl border-4 border-white" alt="Preview" />
                        <button onClick={() => onImageUpload(null)} className="text-xs font-bold text-red-500 hover:underline">Remove Documentation Image</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">Upload Visual Proof</p>
                          <p className="text-xs text-slate-400 font-medium">Handwritten notes, screenshots, or whiteboard photos.</p>
                        </div>
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onImageUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl">Back</Button>
                  <Button onClick={onGenerate} className="flex-1 h-16 rounded-2xl" variant="gradient">
                    <Wand2 className="w-5 h-5" /> Generate Report Text
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && reportData && (
              <div className="space-y-10">
                <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-2xl space-y-10 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 -z-10" />
                  
                  <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                    <div className="space-y-2">
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-[8px] font-bold text-white uppercase tracking-[0.3em] mb-2">Official Documentation</div>
                      <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{companyInfo.name}</h4>
                      <input 
                        className="text-xs text-slate-400 font-bold uppercase tracking-widest bg-transparent border-none focus:ring-0 w-full"
                        value={reportData.report_title}
                        onChange={e => setReportData({ ...reportData, report_title: e.target.value })}
                      />
                    </div>
                    {companyInfo.logo && <img src={companyInfo.logo} className="h-16 object-contain" alt="Logo" />}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Name</p>
                      <input 
                        className="text-sm font-bold text-slate-900 bg-transparent border-none focus:ring-0 w-full p-0"
                        value={reportData.employee.name}
                        onChange={e => setReportData({ ...reportData, employee: { ...reportData.employee, name: e.target.value } })}
                      />
                      <input 
                        className="text-[10px] text-slate-400 font-medium bg-transparent border-none focus:ring-0 w-full p-0"
                        value={reportData.employee.role || ""}
                        onChange={e => setReportData({ ...reportData, employee: { ...reportData.employee, role: e.target.value } })}
                        placeholder="Role"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-slate-900">{format(new Date(reportData.date), "PPP")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Project</p>
                      <input 
                        className="text-sm font-bold text-slate-900 bg-transparent border-none focus:ring-0 w-full p-0"
                        value={reportData.project || ""}
                        onChange={e => setReportData({ ...reportData, project: e.target.value })}
                        placeholder="Project Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        Executive Summary
                      </p>
                      <div className="space-y-3">
                        {reportData.summary_bullets.map((b, i) => (
                          <div key={i} className="flex gap-2 group">
                            <span className="text-slate-300 mt-1.5">•</span>
                            <textarea 
                              className="text-sm text-slate-600 leading-relaxed w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[1.5em]"
                              value={b}
                              onChange={e => {
                                const newBullets = [...reportData.summary_bullets];
                                newBullets[i] = e.target.value;
                                setReportData({ ...reportData, summary_bullets: newBullets });
                              }}
                              rows={1}
                              onInput={e => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = target.scrollHeight + "px";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        Task Documentation
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        {reportData.tasks.map((t, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:bg-white transition-colors">
                            <div className="space-y-1 flex-1">
                              <input 
                                className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 w-full p-0"
                                value={t.task}
                                onChange={e => {
                                  const newTasks = [...reportData.tasks];
                                  newTasks[i].task = e.target.value;
                                  setReportData({ ...reportData, tasks: newTasks });
                                }}
                              />
                              <input 
                                className="text-[10px] text-slate-400 font-medium bg-transparent border-none focus:ring-0 w-full p-0"
                                value={t.output || ""}
                                onChange={e => {
                                  const newTasks = [...reportData.tasks];
                                  newTasks[i].output = e.target.value;
                                  setReportData({ ...reportData, tasks: newTasks });
                                }}
                                placeholder="Task output/details"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <select 
                                value={t.status} 
                                onChange={e => {
                                  const newTasks = [...reportData.tasks];
                                  newTasks[i].status = e.target.value as any;
                                  setReportData({ ...reportData, tasks: newTasks });
                                }}
                                className={cn(
                                  "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border-none focus:ring-0 cursor-pointer",
                                  t.status === "Done" ? "bg-emerald-50 text-emerald-600" : 
                                  t.status === "In Progress" ? "bg-blue-50 text-blue-600" :
                                  t.status === "Pending" ? "bg-amber-50 text-amber-600" :
                                  "bg-slate-100 text-slate-500"
                                )}
                              >
                                <option value="Done">Done</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={onEmail} className="h-16 rounded-2xl">
                    <Mail className="w-5 h-5" /> Generate Email
                  </Button>
                  <Button variant="gradient" onClick={onDownload} className="h-16 rounded-2xl">
                    <Download className="w-5 h-5" /> Download PDF
                  </Button>
                </div>
                <Button onClick={onReset} variant="ghost" className="w-full h-12 rounded-2xl">Create Another Report</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<"landing" | "wizard" | "history">("landing");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [history, setHistory] = useState<{ report: ReportData, company: CompanyInfo }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Form State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    brandColor: "#0f172a",
    website: "",
    address: ""
  });
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: "",
    email: "",
    role: "",
    department: "",
    date: format(new Date(), "yyyy-MM-dd"),
    workingHours: "10:00 AM - 07:00 PM",
    project: ""
  });
  const [textNotes, setTextNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handlePolish = async () => {
    if (!textNotes) return;
    setIsPolishing(true);
    try {
      const polished = await polishText(textNotes);
      setTextNotes(polished);
    } catch (error) {
      console.error(error);
      alert("Failed to polish text.");
    } finally {
      setIsPolishing(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("report_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (report: ReportData, company: CompanyInfo) => {
    const newHistory = [{ report, company }, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("report_history", JSON.stringify(newHistory));
  };

  const handleGenerateReport = async () => {
    if (!companyInfo.name || !employeeInfo.name) return;
    if (!textNotes && !imageFile) {
      alert("Please provide documentation.");
      return;
    }

    setIsLoading(true);
    try {
      let extractedText = "";
      if (imageFile) {
        setLoadingMessage("Extracting visual data...");
        const base64 = await fileToBase64(imageFile);
        extractedText = await extractTextFromImage(base64, imageFile.type);
      }

      setLoadingMessage("AI is structuring your report...");
      const report = await generateStructuredReport(companyInfo, employeeInfo, textNotes, extractedText);
      
      setReportData(report);
      saveToHistory(report, companyInfo);
      setStep(4);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setLoadingMessage("Building high-fidelity PDF...");
    await generateReportPDF(reportData, companyInfo);
    setLoadingMessage("");
  };

  const resetForm = () => {
    setStep(1);
    setReportData(null);
    setTextNotes("");
    setImageFile(null);
    setImagePreview(null);
    setShowSuccess(false);
    setShowEmailModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-transparent to-transparent opacity-50" />
      
      <header className="h-20 border-b border-slate-100 bg-white/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView("landing"); resetForm(); }}>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-slate-900/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-lg leading-none">WorkReport</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">by Digitalliyo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button onClick={() => setView("history")} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">History</button>
            <Button onClick={() => { setView("wizard"); resetForm(); }} className="rounded-full px-8 h-12">New Report</Button>
          </div>
        </div>
      </header>

      <main className="relative">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingView onStart={() => { setView("wizard"); resetForm(); }} onViewHistory={() => setView("history")} />
            </motion.div>
          )}

          {view === "history" && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryView 
                history={history} 
                onBack={() => setView("landing")} 
                onSelect={(item) => {
                  setReportData(item.report);
                  setCompanyInfo(item.company);
                  setView("wizard");
                  setStep(4);
                }} 
              />
            </motion.div>
          )}

          {view === "wizard" && (
            <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WizardView 
                step={step}
                setStep={setStep}
                companyInfo={companyInfo}
                setCompanyInfo={setCompanyInfo}
                employeeInfo={employeeInfo}
                setEmployeeInfo={setEmployeeInfo}
                textNotes={textNotes}
                setTextNotes={setTextNotes}
                imagePreview={imagePreview}
                onImageUpload={(file) => {
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                }}
                onGenerate={handleGenerateReport}
                reportData={reportData}
                onDownload={handleDownloadPDF}
                onReset={resetForm}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                onEmail={() => setShowEmailModal(true)}
                onPolish={handlePolish}
                isPolishing={isPolishing}
                setReportData={setReportData}
                onFinalize={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showSuccess && (
        <SuccessPopup 
          onDownload={handleDownloadPDF} 
          onEmail={() => { setShowSuccess(false); setShowEmailModal(true); }} 
          onReset={resetForm} 
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showEmailModal && reportData && (
        <EmailModal report={reportData} onClose={() => setShowEmailModal(false)} />
      )}

      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">WR</div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight">WorkReport</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Premium Documentation</span>
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs text-slate-400 font-medium">Developed By <span className="text-slate-900 font-bold">Habib Nayeem</span></p>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">| Powered By Digitalliyo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
