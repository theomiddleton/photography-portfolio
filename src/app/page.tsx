import React from 'react';
import Link from "next/link";
import { SiteHeader } from '~/components/site-header';

export default async function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
        <SiteHeader />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Center
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-black/10 p-4 hover:bg-black/20"
              href="admin/"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Link one</h3>
              <div className="text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Etiam tempor volutpat urna id semper.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-black/10 p-4 hover:bg-black/20"
              href="docs/"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Link two</h3>
              <div className="text-lg">
              Quisque vel mi non metus finibus semper et id elit.
              Quisque tristique quam vel urna accumsan tempor.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">

          </div>
        </div>
      </main>
    );
  }
