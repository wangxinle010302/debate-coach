"use client";
import { useEffect, useState } from "react";

export default function Consent() {
  const [ok, setOk] = useState(true);
  useEffect(() => { setOk(localStorage.getItem("consent-ok")==="1"); }, []);
  if (ok) return null;
  return (
    <div style={{position:"sticky",top:0,zIndex:50,background:"#fff7ed",
      border:"1px solid #fed7aa",padding:"10px 12px",borderRadius:10,marginBottom:12}}>
      <b>Privacy:</b> voice is transcribed in your browser; we don’t store audio. You can switch to typing anytime.
      <button className="btn" style={{marginLeft:12}}
        onClick={()=>{ localStorage.setItem("consent-ok","1"); setOk(true); }}>
        I understand
      </button>
    </div>
  );
}
