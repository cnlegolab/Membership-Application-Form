import React, { useState, useRef } from 'react';
import type { FormData } from './types';
import { AFFILIATIONS } from './constants';

declare const html2canvas: any;

interface FormFieldProps {
  id: keyof FormData | 'guardianName' | 'guardianPhone';
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  Icon?: (props: React.ComponentProps<'svg'>) => JSX.Element;
  error?: string;
  children?: React.ReactNode;
  readOnly?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, type = "text", placeholder, value, onChange, Icon, error, children, readOnly }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </span>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full h-10 px-3 leading-10 border rounded-md shadow-sm transition duration-150 ease-in-out text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${value ? 'bg-slate-200 font-medium' : 'bg-slate-50'} ${Icon ? 'pl-10' : ''} ${readOnly ? 'cursor-not-allowed !bg-gray-200' : ''} ${error ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
      />
      {children}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    affiliation: '', nameKorean: '', nameEnglish: '',
    membershipType: '', gender: '', email: '',
    phoneApplicant: '',
    guardianRelationship: '', guardianName: '', guardianPhone: '',
    address: '', signature: '',
    dateOfBirth: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [englishNameWarning, setEnglishNameWarning] = useState<string>('');
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [benefitsChecked, setBenefitsChecked] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'profileImage' | 'guardianRelationship' | 'guardianName' | 'guardianPhone', string>>>({});

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEnglishNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[A-Za-z\s-]*$/;
    if (regex.test(value)) {
      setFormData(prev => ({ ...prev, nameEnglish: value }));
      setEnglishNameWarning('');
      if (errors.nameEnglish) setErrors(prev => ({...prev, nameEnglish: undefined}));
    } else {
      setEnglishNameWarning('영문, 공백, 하이픈(-)만 입력 가능합니다.');
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
        if (errors.profileImage) {
          setErrors(prev => ({ ...prev, profileImage: undefined }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const calculateGrade = (birthDate: string): string => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const koreanAge = age + 1;

    if (koreanAge >= 17) return `고${koreanAge - 16}`;
    if (koreanAge >= 14) return `중${koreanAge - 13}`;
    if (koreanAge >= 8) return `초${koreanAge - 7}`;
    if (koreanAge >= 1) return '미취학';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'profileImage', string>> = {};
    if (!profileImage) newErrors.profileImage = '프로필 사진을 업로드해주세요.';
    if (!formData.affiliation) newErrors.affiliation = '소속 단체명을 선택해주세요.';
    if (!formData.nameKorean) newErrors.nameKorean = '한글 성명을 입력해주세요.';
    if (!formData.nameEnglish) newErrors.nameEnglish = '영문 성명을 입력해주세요.';
    if (!formData.membershipType) newErrors.membershipType = '가입 구분을 선택해주세요.';
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요.';
    if (!formData.email) newErrors.email = '이메일 주소를 입력해주세요.';
    if (!formData.phoneApplicant) newErrors.phoneApplicant = '신청자 핸드폰 번호를 입력해주세요.';
    if (!formData.guardianRelationship) newErrors.guardianRelationship = '보호자와의 관계를 선택해주세요.';
    if (!formData.guardianName) newErrors.guardianName = '보호자 성명을 입력해주세요.';
    if (!formData.guardianPhone) newErrors.guardianPhone = '보호자 핸드폰 번호를 입력해주세요.';
    if (!formData.address) newErrors.address = '전체 주소를 입력해주세요.';
    if (!formData.signature) newErrors.signature = '서명을 입력해주세요.';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = '생년월일을 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validateForm()) {
        const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors;
        const firstErrorElement = document.getElementById(firstErrorKey);
        if(firstErrorElement) {
            firstErrorElement.focus({ preventScroll: true });
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    if (!pledgeChecked) {
        alert("서약서에 동의해주셔야 제출이 가능합니다.");
        return;
    }
    
    const element = formRef.current;
    if (element) {
        const elementsToHide = element.querySelectorAll('.print-ignore');
        elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

        const canvas = await html2canvas(element, { scale: 2 });
        
        elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');

        const a4Width = 1240;
        const a4Height = 1754;
        
        const a4Canvas = document.createElement('canvas');
        a4Canvas.width = a4Width;
        a4Canvas.height = a4Height;
        const a4Ctx = a4Canvas.getContext('2d');
        
        if (a4Ctx) {
            a4Ctx.fillStyle = 'white';
            a4Ctx.fillRect(0, 0, a4Width, a4Height);

            const title = "국제청소년로봇연맹 로봇봉사단 입회신청서";
            a4Ctx.fillStyle = 'black';
            a4Ctx.font = 'bold 48px Poppins';
            a4Ctx.textAlign = 'center';
            a4Ctx.fillText(title, a4Width / 2, 100);

            const contentMargin = 50;
            const contentStartY = 160;
            const availableWidth = a4Width - (contentMargin * 2);
            const availableHeight = a4Height - contentStartY - contentMargin;
            const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
            const newWidth = canvas.width * ratio;
            const newHeight = canvas.height * ratio;
            const x = (a4Width - newWidth) / 2;
            const y = contentStartY + (availableHeight - newHeight) / 2;
            
            a4Ctx.drawImage(canvas, x, y, newWidth, newHeight);
        }

        const link = document.createElement('a');
        const formattedDate = today.toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '');
        link.download = `${formData.nameKorean}_${formattedDate}_입회신청서.jpeg`;
        link.href = a4Canvas.toDataURL('image/jpeg', 1.0);
        link.click();
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div ref={formRef} className="bg-white rounded-xl shadow-2xl p-8 md:p-10 space-y-8">
          <div className="text-center pb-4 print-ignore">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                국제청소년로봇연맹 로봇봉사단 입회신청서
              </h1>
          </div>
          
          {/* Applicant Info Section */}
          <fieldset className="space-y-5">
            <legend className="text-xl font-bold text-slate-700 w-full pb-3 border-b-2 border-slate-200 tracking-wide">가입자 정보</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="sm:col-span-2">
                      <label htmlFor="affiliation" className="block text-sm font-semibold text-gray-700 mb-1.5">소속 단체명</label>
                      <select id="affiliation" name="affiliation" value={formData.affiliation} onChange={handleChange} className={`w-full h-10 px-3 border rounded-md shadow-sm transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formData.affiliation ? 'bg-slate-200 font-medium text-gray-900' : 'bg-slate-50 text-gray-500'} ${errors.affiliation ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}>
                          <option value="" disabled>소속 단체명을 선택하세요</option>
                          {AFFILIATIONS.map((name, index) => (
                              <option key={index} value={name}>{name}</option>
                          ))}
                      </select>
                      {errors.affiliation && <p className="mt-1.5 text-xs text-red-600">{errors.affiliation}</p>}
                  </div>
                  <FormField id="nameKorean" label="성명 (한글)" value={formData.nameKorean} onChange={handleChange} error={errors.nameKorean} />
                  <div>
                    <FormField id="nameEnglish" label="성명 (영문)" value={formData.nameEnglish} onChange={handleEnglishNameChange} />
                    {englishNameWarning && <p className="mt-1.5 text-xs text-red-600">{englishNameWarning}</p>}
                    {errors.nameEnglish && !englishNameWarning && <p className="mt-1.5 text-xs text-red-600">{errors.nameEnglish}</p>}
                  </div>
                  <div className="sm:col-span-2">
                      <div className="grid grid-cols-3 gap-4 items-start">
                          <div className="col-span-2">
                              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-1.5">생년월일</label>
                              <input 
                                  type="date" 
                                  id="dateOfBirth" 
                                  name="dateOfBirth" 
                                  value={formData.dateOfBirth} 
                                  onChange={handleChange} 
                                  max={todayDate} 
                                  className={`w-full h-10 px-3 leading-10 border rounded-md shadow-sm transition duration-150 ease-in-out text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formData.dateOfBirth ? 'bg-slate-200 font-medium' : 'bg-slate-50'} ${errors.dateOfBirth ? 'border-red-500 ring-red-500' : 'border-gray-300'}`} 
                                  style={{ colorScheme: 'light' }}
                              />
                              {errors.dateOfBirth && <p className="mt-1.5 text-xs text-red-600">{errors.dateOfBirth}</p>}
                          </div>
                          <div className="col-span-1">
                              <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-1.5">학년</label>
                              <input
                                  type="text"
                                  id="grade"
                                  name="grade"
                                  value={calculateGrade(formData.dateOfBirth)}
                                  readOnly
                                  placeholder="-"
                                  className="w-full h-10 px-3 leading-10 border rounded-md shadow-sm bg-gray-200 text-gray-700 cursor-not-allowed text-center font-semibold"
                              />
                          </div>
                      </div>
                  </div>
              </div>
              <div className="flex flex-col items-center justify-start space-y-2 pt-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 w-full text-center">프로필 사진</label>
                  <div onClick={() => fileInputRef.current?.click()} className={`w-48 h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors ${profileImage ? 'border-indigo-500' : 'border-gray-300 hover:border-indigo-500'} ${errors.profileImage ? 'border-red-500' : ''}`}>
                      {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-md"/>
                      ) : (
                          <div className="text-center text-gray-500 p-4">
                              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.437 4h3.126a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <p className="mt-2 text-sm">클릭하여 사진 업로드</p>
                          </div>
                      )}
                  </div>
                  {errors.profileImage && <p className="mt-1.5 text-xs text-red-600 text-center">{errors.profileImage}</p>}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-4">
                  <div>
                      <span className="block text-sm font-semibold text-gray-700 mb-2">가입 구분</span>
                      <div className="flex items-center space-x-6">
                          {['단체', '개인'].map(type => (
                              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name="membershipType" value={type} checked={formData.membershipType === type} onChange={handleChange} className="appearance-none h-4 w-4 rounded-sm bg-white border-2 border-gray-300 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"/>
                                  <span className="font-medium text-gray-800">{type}</span>
                              </label>
                          ))}
                      </div>
                      {errors.membershipType && <p className="mt-1.5 text-xs text-red-600">{errors.membershipType}</p>}
                  </div>
                  <div>
                      <span className="block text-sm font-semibold text-gray-700 mb-2">성별</span>
                      <div className="flex items-center space-x-6">
                          {['남', '여'].map(gender => (
                              <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name="gender" value={gender} checked={formData.gender === gender} onChange={handleChange} className="appearance-none h-4 w-4 rounded-sm bg-white border-2 border-gray-300 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"/>
                                  <span className="font-medium text-gray-800">{gender}</span>
                              </label>
                          ))}
                      </div>
                      {errors.gender && <p className="mt-1.5 text-xs text-red-600">{errors.gender}</p>}
                  </div>
                  <FormField id="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                  <FormField id="phoneApplicant" label="핸드폰 (신청자)" type="tel" value={formData.phoneApplicant} onChange={handleChange} error={errors.phoneApplicant} />
                  <div className="sm:col-span-2">
                      <FormField id="address" label="전체 주소 (상세주소 포함)" value={formData.address} onChange={handleChange} error={errors.address}/>
                  </div>
              </div>
          </fieldset>
          
          {/* Guardian Info Section */}
          <fieldset className="space-y-5">
              <legend className="text-xl font-bold text-slate-700 w-full pb-3 border-b-2 border-slate-200 tracking-wide">보호자 정보</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <div>
                      <label htmlFor="guardianRelationship" className="block text-sm font-semibold text-gray-700 mb-1.5">입회자와의 관계</label>
                      <select id="guardianRelationship" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className={`w-full h-10 px-3 border rounded-md shadow-sm transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formData.guardianRelationship ? 'bg-slate-200 font-medium text-gray-900' : 'bg-slate-50 text-gray-500'} ${errors.guardianRelationship ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}>
                          <option value="" disabled>관계를 선택하세요</option>
                          <option value="부">부 (Father)</option>
                          <option value="모">모 (Mother)</option>
                      </select>
                      {errors.guardianRelationship && <p className="mt-1.5 text-xs text-red-600">{errors.guardianRelationship}</p>}
                  </div>
                  <FormField id="guardianName" label="보호자 성명" value={formData.guardianName} onChange={handleChange} error={errors.guardianName} />
                  <FormField id="guardianPhone" label="보호자 휴대전화" type="tel" value={formData.guardianPhone} onChange={handleChange} error={errors.guardianPhone} />
              </div>
          </fieldset>

          {/* Agreement */}
          <div className="border-t border-gray-200 pt-6 text-center space-y-5">
              <p className="text-sm text-gray-600 bg-slate-100 p-4 rounded-lg">상기 본인은 국제청소년연맹 로봇봉사단 설립취지에 적극 동의하며, 국제청소년연맹 로봇봉사단에 입회하여 로봇봉사단 정회원으로 주어진 책임을 성실하게 이행하고, 섬김과 나눔의 로봇봉사단의 정신을 구현하기 위해 소정의 서류를 갖추어 지원합니다.</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 pt-2 text-base">
                  <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">가입일:</span>
                      <span className="text-gray-900 font-bold">{todayString}</span>
                  </div>
                  <div className="flex items-center gap-2 w-full max-w-xs">
                      <label htmlFor="signature" className="font-semibold text-gray-700 whitespace-nowrap">지원자:</label>
                      <div className="w-full">
                          <input
                              type="text"
                              id="signature"
                              name="signature"
                              value={formData.signature}
                              onChange={handleChange}
                              placeholder="서명 입력"
                              className={`w-full h-10 px-3 leading-10 border rounded-md shadow-sm transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center ${formData.signature ? 'bg-slate-200 font-semibold text-gray-900' : 'bg-slate-50 text-gray-900'} ${errors.signature ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                          />
                      </div>
                  </div>
              </div>
              {errors.signature && <p className="mt-1 text-xs text-red-600 sm:w-full sm:text-center">{errors.signature}</p>}
          </div>
          
          {/* Checkboxes */}
          <div className="border-t border-gray-200 pt-5 space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={benefitsChecked} onChange={(e) => { setBenefitsChecked(e.target.checked); if(e.target.checked) setIsBenefitsModalOpen(true); }} className="appearance-none h-4 w-4 rounded-sm bg-white border-2 border-gray-300 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" />
                  <span className="text-gray-700 font-medium">국제청소년로봇연맹 로봇봉사단 봉사활동 혜택 안내</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={pledgeChecked} onChange={(e) => { if(e.target.checked) { setIsPledgeModalOpen(true); } else { setPledgeChecked(false); } }} className="appearance-none h-4 w-4 rounded-sm bg-white border-2 border-gray-300 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" />
                  <span className="text-gray-700 font-medium">서약서를 확인하고 서명하겠습니다.</span>
              </label>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-6 flex justify-end print-ignore">
            <button onClick={handleSubmit} disabled={!pledgeChecked} className={`py-2 px-6 rounded-lg shadow-lg text-base font-bold text-white transition-all duration-300 ${!pledgeChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-1'}`}>
              입회 신청서 제출
            </button>
        </div>
      </div>
      
        {/* Pledge Modal */}
        {isPledgeModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 md:p-8 animate-fade-in-scale">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">서약서</h2>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 text-gray-700 space-y-4 text-sm leading-relaxed">
                        <p>본인은 가입일로부터 국제청소년로봇연맹 로봇봉사단의 일원으로서 활동에 참여함에 있어, 봉사단의 설립 취지와 목적을 깊이 이해하고 이를 존중하며 다음과 같이 서약합니다.</p>
                        <p>본인은 국제청소년로봇연맹 로봇봉사단의 일원으로서 봉사단의 사명과 임무를 성실히 숙지하고, 모든 활동에서 책임감 있고 적극적인 태도로 임하겠습니다.</p>
                        <p>본인은 봉사단 파견 전까지의 모든 준비 과정에 성실히 참여하며, 열정과 헌신으로 봉사활동을 준비하여 봉사단의 명예를 지키겠습니다.</p>
                        <p>본인은 국제청소년로봇연맹 로봇봉사단의 규약과 활동지침을 철저히 준수하며, 단체의 질서와 규율을 존중하겠습니다. 또한 개인적인 판단이나 자의적인 행동으로 인해 발생하는 모든 문제와 결과에 대하여 스스로 책임을 지겠습니다.</p>
                        <p>본인은 봉사활동 전 과정에서 협력과 배려의 정신을 바탕으로 타 단원 및 관계자들과 원활히 소통하며, 봉사단의 발전과 긍정적인 활동 문화 조성에 기여하겠습니다.</p>
                        <p>본인은 국제청소년로봇연맹 로봇봉사단의 일원임을 항상 자부심으로 여기며, 모든 활동을 통해 지역사회와 국제사회에 긍정적인 영향을 주고 봉사의 가치를 확산하는 데 앞장서겠습니다.</p>
                        <p className="font-semibold">위와 같이 서약하며, 본 서약서가 가지는 책임과 의미를 엄중히 인식하고 이에 동의하여 제출합니다.</p>
                    </div>
                    <div className="mt-8 border-t pt-6 text-gray-800 space-y-2">
                        <p><span className="font-semibold">작성일자 :</span> {todayString}</p>
                        <p><span className="font-semibold">소속 :</span> {formData.affiliation || '미선택'}</p>
                        <p><span className="font-semibold">성명 :</span> {formData.nameKorean || '미입력'} (서명/인)</p>
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={() => { setIsPledgeModalOpen(false); setPledgeChecked(true); }} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">확인</button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Benefits Modal */}
        {isBenefitsModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 md:p-8 animate-fade-in-scale">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">로봇봉사단 봉사점수 안내</h2>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 text-gray-700 space-y-4 text-sm leading-relaxed">
                        <p>국제청소년로봇연맹 로봇봉사단에 입회하여 센터에서 로봇 재능기부 활동에 참여할 경우, 학생들은 학교생활기록부에 반영되는 공식 봉사활동 점수를 인정받을 수 있습니다. 이는 고등학교 내신 및 생활기록부에 중요한 요소로 반영될 수 있으며, 대학 입시에서도 긍정적인 효과를 가져올 수 있습니다.</p>
                        <h3 className="font-semibold text-md text-gray-800 pt-2">📌 봉사활동 인정 요건</h3>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            <li><span className="font-semibold">최소 시간 기준:</span> 1회 참여 시 최소 1시간 이상 활동해야 봉사시간으로 인정됩니다.</li>
                            <li><span className="font-semibold">1일 최대 인정 시간:</span> 하루에 인정되는 봉사시간은 최대 4시간 이내입니다.</li>
                            <li><span className="font-semibold">활동 가능 기관:</span> 영리 목적 기관, 종교적·정치적 목적 기관, 공익에 반하는 기관에서의 봉사활동은 인정되지 않습니다. 센터에서 진행하는 로봇 재능기부 활동은 공익성과 교육적 목적을 갖추고 있어 공식적으로 인정됩니다.</li>
                            <li><span className="font-semibold">해외 봉사활동:</span> 해외에서 진행된 봉사활동은 학교생활기록부에 기재되지 않으며, 원칙적으로 인정되지 않습니다.</li>
                            <li><span className="font-semibold">봉사활동 실적의 인정 방법:</span> 학교장이 추천하거나 허가한 봉사활동만 생활기록부에 기재할 수 있습니다. 1365 봉사 포털을 통한 등록 시 반드시 사전 상담 및 확인 절차가 필요합니다.</li>
                        </ul>
                         <h3 className="font-semibold text-md text-gray-800 pt-2">✅ 센터에서의 혜택</h3>
                        <p>센터에서 로봇교육 및 재능기부 활동에 참여하면 위 기준에 따라 봉사활동 점수를 공식적으로 인정받을 수 있습니다.</p>
                        <p>학생들은 단순 봉사활동이 아닌 <strong className="font-semibold text-indigo-600">전문적 재능기부(로봇, 코딩, 교육 보조 등)</strong>를 통해 자신만의 특색 있는 봉사 실적을 쌓을 수 있으며, 이는 학교생활기록부에 긍정적으로 반영됩니다.</p>
                    </div>
                     <div className="mt-8 text-center">
                        <button onClick={() => { setIsBenefitsModalOpen(false); }} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">확인</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default App;