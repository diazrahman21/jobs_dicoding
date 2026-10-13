"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function RouteHero() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <section className="HeaderPage_header-intro__Y2jj1 HeaderPage_wayfinder-bg__hLUNZ ">
      <div className="container pt-4">
        <div className="row p-2">
          <div className="col-md-12">
            <h3 className="HeaderPage_header-intro--title__bFsKD">Dicoding Jobs</h3>
          </div>
        </div>
        <div className="row p-2">
          <div className="col-sm-8 col-md-9 col-lg-7 col-xl-6">
            <h1 className="HeaderPage_header-intro--subtitle__Jxkcu">
              Temukan lowongan yang cocok untuk kamu
              <Image
                src="/assets/hero-photo.png"
                alt="Hero Dicoding Jobs"
                width={328}
                height={103}
                className="ml-[10px] inline-block h-[61px] w-[203px] rounded-full align-middle object-contain"
              />
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}