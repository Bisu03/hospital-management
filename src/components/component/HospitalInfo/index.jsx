import Image from "next/image";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaHashtag,
  FaFileAlt,
  FaDollarSign,
} from "react-icons/fa";

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  );
};

export default function HospitalInfoCard(props) {
  const {
    hospital_name,
    address,
    phone,
    email,
    hospitalCode,
    gst_number,
    reg_number,
    licence_number,
    logo,
    banner,
    language,
    timezone,
    currency,
    currency_symbol,
  } = props;

  return (
    <div className="p-8">
      {
        banner && <div className="flex justify-center w-full bg-accent">
          <Image
            height={200}
            width={1000}
            src={
              banner}
            alt="image"
            className="w-[1000px] h-[120px]   "
          />
        </div>}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">

          <div className="w-20 h-20 mr-4 relative">
            <Image
              src={logo}
              alt={`${hospital_name} logo`}
              width={80}
              height={80}
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hospital_name}</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{language}</p>
          <p className="text-sm text-gray-600">{timezone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <InfoItem icon={<FaBuilding className="w-5 h-5" />} label="Address" value={address} />
          <InfoItem icon={<FaPhone className="w-5 h-5" />} label="Phone" value={phone} />
          <InfoItem icon={<FaEnvelope className="w-5 h-5" />} label="Email" value={email} />
          <InfoItem icon={<FaHashtag className="w-5 h-5" />} label="Hospital Code" value={hospitalCode} />
        </div>
        <div className="space-y-3">
          <InfoItem icon={<FaFileAlt className="w-5 h-5" />} label="GST Number" value={gst_number} />
          <InfoItem icon={<FaFileAlt className="w-5 h-5" />} label="Registration Number" value={reg_number} />
          <InfoItem icon={<FaFileAlt className="w-5 h-5" />} label="Licence Number" value={licence_number} />
          <InfoItem icon={<FaDollarSign className="w-5 h-5" />} label="Currency" value={`${currency} (${currency_symbol})`} />
        </div>
      </div>
    </div>
  );
}
