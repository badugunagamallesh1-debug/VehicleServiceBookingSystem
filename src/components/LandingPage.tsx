/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, MapPin, BadgeDollarSign, HeartHandshake, PhoneCall, CheckCircle2, Star } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="space-y-16" id="landing-page-root">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white rounded-3xl overflow-hidden relative shadow-2xl">
        {/* Decorative Grid Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            ✨ Next-Gen Automotive Ecosystem
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Seamless Vehicle Servicing, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Guided by Real-Time Location APIs
            </span>
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate scheduling uncertainty. Add your vehicles, map nearest branches, schedule periodic services with instant mechanic dispatch, and monitor repair milestones via live tracking.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/35 transition-all cursor-pointer w-full sm:w-auto"
            >
              Book Your Service Now
            </button>
            <a
              href="#learn-more"
              className="px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all w-full sm:w-auto"
            >
              Explore Branch Map
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4" id="learn-more">
        {[
          { icon: ShieldCheck, title: 'Certified Mechanics', desc: 'Pre-screened & highly trained expert mechanics' },
          { icon: MapPin, title: 'Smart Live Maps', desc: 'Pickup point selection and distance matrices' },
          { icon: BadgeDollarSign, title: 'No Hidden Fees', desc: 'Upfront prices, OEM spares, itemized invoices' },
          { icon: HeartHandshake, title: 'Guaranteed Care', desc: '15-day complete post-service parts protection' }
        ].map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">{badge.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{badge.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Workflow Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">How the Platform Works</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">Get your vehicle serviced in 4 straightforward milestones under strict quality controls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { num: '01', title: 'Register Vehicle', desc: 'Register your model and license plate specifications.' },
            { num: '02', title: 'Select Location', desc: 'Pinpoint nearby branches and pickup points via Maps.' },
            { num: '03', title: 'Live Tracker', desc: 'Monitor status in real-time as repairs progress.' },
            { num: '04', title: 'Secure Checkout', desc: 'Process payment securely and download your PDF invoice.' }
          ].map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden group">
              <span className="absolute -right-4 -bottom-4 text-6xl font-black text-slate-100/80 font-mono transition-colors group-hover:text-blue-50">
                {step.num}
              </span>
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md mb-4">
                Step {step.num}
              </span>
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonial Panel */}
      <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/3 space-y-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">What Our Customers Love</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Over 10,000 satisfied car and bike owners trust our unified Maps booking service. We prioritize precise updates over guesswork.
          </p>
        </div>
        
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-3">
            <p className="text-xs text-slate-600 italic">
              "Being able to select a precise pickup spot on Google Maps and watch the mechanic status in real-time is amazing. Best periodic service I have ever experienced!"
            </p>
            <div className="flex items-center space-x-2.5">
              <div className="bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">MR</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Michael Ross</h4>
                <p className="text-[10px] text-slate-400">Tesla Model 3 Owner</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-3">
            <p className="text-xs text-slate-600 italic">
              "Their transparency on spare parts used and the itemized checkout invoice saved me a lot of money. Fully verified with no surprise upcharges!"
            </p>
            <div className="flex items-center space-x-2.5">
              <div className="bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">AK</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Amara K.</h4>
                <p className="text-[10px] text-slate-400">Yamaha R15 Rider</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Contact Area */}
      <section className="bg-slate-900 text-slate-300 rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl space-y-6 relative z-10">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <PhoneCall className="w-5 h-5 text-blue-400" />
            <span>Need Emergency Roadside Assistance?</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our priority breakdown support dispatch mechanics are active 24/7. Standard towing, battery jumpstarts, and flat tire assistance can be targeted to your exact location using mobile geolocation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Helpline Toll Free</p>
              <p className="text-sm font-mono font-bold text-white mt-0.5">1-800-555-SERV</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Operational Hours</p>
              <p className="text-sm font-mono font-bold text-white mt-0.5">24 Hours / 7 Days</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
