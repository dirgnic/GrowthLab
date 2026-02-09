"""
Challenge definitions for Heidi portfolio
"""

CHALLENGES = [
    {
        "id": "paid-media-a",
        "title": "Paid Media Task A — Media Buying & Growth",
        "category": "Growth & Paid Media",
        "description": "Design and partially simulate a paid media–led market entry for Heidi in a country where brand awareness is zero, search demand for 'AI medical scribe' is negligible, and clinicians are not actively shopping for this solution. You are given $50,000 over 90 days.",
        "requirements": [
            "A 90-day spend plan (channel mix + sequencing)",
            "A clear funnel from first impression → early user",
            "A defined set of leading indicators you would track before CPA matters",
            "At least: 1 awareness ad, 1 mid-funnel retargeting ad, 1 landing page or logged-out experience",
            "A concrete mechanism for capturing early users (waitlist, tool, demo flow, etc.)"
        ],
        "solution": {
            "type": "spend-plan",
            "data": {
                "market": "Australia",
                "budget": 50000,
                "timeline": 90,
                "channels": [
                    {
                        "name": "Meta (Facebook/Instagram)",
                        "allocation": 20000,
                        "percentage": 40,
                        "purpose": "Awareness + cold traffic",
                        "sequencing": "Days 1-90"
                    },
                    {
                        "name": "Google Search & Display",
                        "allocation": 15000,
                        "percentage": 30,
                        "purpose": "Intent capture + retargeting",
                        "sequencing": "Days 15-90"
                    },
                    {
                        "name": "LinkedIn",
                        "allocation": 10000,
                        "percentage": 20,
                        "purpose": "B2B + clinic network targeting",
                        "sequencing": "Days 30-90"
                    },
                    {
                        "name": "Influencer + Community",
                        "allocation": 5000,
                        "percentage": 10,
                        "purpose": "Earned trust + local credibility",
                        "sequencing": "Days 45-90"
                    }
                ],
                "funnel": {
                    "impression": "Cold awareness: 'Clinicians are drowning in admin. We built AI to fix it.'",
                    "consideration": "Retargeting: show ROI calculator, customer stories, security/compliance",
                    "conversion": "Landing page + demo booking + 14-day free trial"
                },
                "leadingIndicators": [
                    "Click-through rate (CTR) by creative & audience",
                    "Landing page engagement (scroll depth, time on page)",
                    "Demo booking rate",
                    "Waitlist growth rate",
                    "Video watch rate (if video ads used)",
                    "Community mentions & organic shares"
                ],
                "ads": {
                    "awareness": {
                        "platform": "Meta (Reels + Feed)",
                        "headline": "You finish clinic at 5pm. Your work doesn’t.",
                        "primaryText": "Most clinicians do a second shift at night: notes. Heidi helps you get that time back — without sacrificing quality.",
                        "creativeDirection": "Close-up: clinician closing laptop at 9:47pm; overlay text: 'Unpaid shift.' Cut to calm consult moment.",
                        "cta": "Get the checklist"
                    },
                    "retargeting": {
                        "platform": "Meta Retargeting + Google Display",
                        "headline": "How many hours does your clinic lose to admin?",
                        "primaryText": "Answer 6 questions to see your annual admin load — then get a concrete plan to cut it.",
                        "creativeDirection": "Simple calculator UI + result screen (hours/year).",
                        "cta": "Run the audit"
                    }
                },
                "landingPage": {
                    "name": "Admin Burden Audit (logged-out tool)",
                    "valueProp": "A 60-second workflow audit that estimates admin hours/year and recommends the top 3 fixes.",
                    "sections": [
                        "Problem framing (burnout + after-hours work)",
                        "Audit inputs (6 questions)",
                        "Personalized report (hours + $ proxy)",
                        "CTA: waitlist / demo request"
                    ],
                    "demoRoute": "/tools/admin-audit"
                }
            }
        }
    },
    {
        "id": "paid-media-b",
        "title": "Paid Media Task B — Creative Systems",
        "category": "Growth & Paid Media",
        "description": "Build and demonstrate a working, end-to-end AI-powered creative system for paid media. This is not a concept. You must show it running.",
        "requirements": [
            "A functioning creative pipeline using tools like n8n, Claude Code, Sora / Runway / image tools",
            "Inputs: persona, market, funnel stage; Outputs: ready-to-run ad creatives",
            "At least: 3 awareness creatives, 2 mid-funnel creatives, 1 conversion-focused creative, 1 non-English creative",
            "A lightweight system for managing, tagging, and iterating creatives",
            "A system diagram showing where AI ends and human judgment begins"
        ],
        "solution": {
            "type": "creative-pipeline",
            "data": {
                "pipelineStages": [
                    {
                        "stage": "1. Input Specification",
                        "description": "User inputs: persona, pain point, market, funnel stage"
                    },
                    {
                        "stage": "2. AI Generation (Claude)",
                        "description": "Generate 3-5 creative concepts + copy variations"
                    },
                    {
                        "stage": "3. Human Review",
                        "description": "Creative lead reviews for brand fit, compliance"
                    },
                    {
                        "stage": "4. Asset Production",
                        "description": "Generate visuals (DALL-E / Runway), finalize copy"
                    },
                    {
                        "stage": "5. Testing & Iteration",
                        "description": "A/B test, measure performance, iterate top performers"
                    }
                ],
                "creatives": [
                    {
                        "type": "Awareness",
                        "title": "The Invisible Work",
                        "description": "Highlight after-hours admin burden; emotional hook before product",
                        "copy": "You finish clinic at 5pm. Your work doesn't.",
                        "platform": "Meta"
                    },
                    {
                        "type": "Awareness",
                        "title": "Clinician Testimonial",
                        "description": "Real GP talking about time saved",
                        "copy": "Heidi gave me back 2 hours every day",
                        "platform": "LinkedIn"
                    },
                    {
                        "type": "Awareness",
                        "title": "Problem Agitation",
                        "description": "Show the chaos (unstructured notes, clicking)",
                        "copy": "Your EHR wasn't designed for you. Heidi was.",
                        "platform": "Google Display"
                    },
                    {
                        "type": "Awareness (ES)",
                        "title": "Menos pantalla. Más paciente.",
                        "description": "Spanish creative for expansion markets; same insight, local language",
                        "copy": "Tu consulta termina. El papeleo no. Heidi te devuelve el tiempo.",
                        "platform": "Meta (ES)"
                    },
                    {
                        "type": "Mid-Funnel",
                        "title": "ROI Calculator",
                        "description": "Interactive tool showing time/cost savings",
                        "copy": "See how much time (and money) Heidi saves your clinic",
                        "platform": "Landing Page"
                    },
                    {
                        "type": "Mid-Funnel",
                        "title": "Comparison Table",
                        "description": "Heidi vs traditional transcription + manual entry",
                        "copy": "The AI that understands your specialty",
                        "platform": "Meta Retargeting"
                    },
                    {
                        "type": "Conversion",
                        "title": "Trial CTA",
                        "description": "Free 14-day trial, no credit card, specific use case",
                        "copy": "Try Heidi free for 14 days on your next patient",
                        "platform": "All Channels"
                    }
                ],
                "governance": {
                    "aiGenerates": ["Concepts", "Copy variations", "Visual briefs", "Iteration suggestions"],
                    "humanDecides": ["Brand safety", "Compliance (HIPAA/GDPR)", "Messaging priority", "Launch approval"],
                    "frequencyPerWeek": "3-5 new creative sets tested"
                },
                "demoRoute": "/tools/creative-generator"
            }
        }
    },
    {
        "id": "organic-flywheel",
        "title": "Build One Organic Flywheel",
        "category": "Organic Growth",
        "description": "Build and demonstrate one organic growth asset Heidi is not currently doing that could plausibly drive 100,000 incremental signups over 12 months. You must show something real.",
        "requirements": [
            "A live page, prototype, or clickable demo of the asset",
            "A concrete discovery path (search, social, communities, referrals)",
            "A clear conversion mechanism from asset → Heidi signup",
            "A simple growth model explaining how this compounds"
        ],
        "solution": {
            "type": "organic-asset",
            "data": {
                "asset": "Clinical Workflow Optimization Checklist",
                "premise": "Clinicians search for 'how to reduce admin burden' and 'faster patient notes' but don't yet know AI scribe solutions exist",
                "discoveryPath": [
                    {
                        "channel": "SEO",
                        "keyword": "clinical admin burden, medical scribe, reduce charting time, EHR burden",
                        "estimatedMonthlySearches": 45000
                    },
                    {
                        "channel": "Reddit/Communities",
                        "platforms": "r/medicine, r/Residency, r/Nursing, KevinMD forums",
                        "strategy": "Organic sharing by clinicians facing the problem"
                    },
                    {
                        "channel": "LinkedIn",
                        "strategy": "Shared by healthcare admins and clinic leaders optimizing workflows"
                    }
                ],
                "asset_description": "Interactive checklist that helps clinics audit where they waste time on admin. Users answer ~15 questions, get personalized report on 'admin waste' in hours/week/cost",
                "demoRoute": "/tools/admin-audit",
                "conversionMechanism": {
                    "step1": "User completes checklist, sees report",
                    "step2": "Report shows 'typical clinic wastes 200 hours/year' → comparison to competitors",
                    "step3": "CTA: 'See how Heidi compares' → signup to see Heidi pricing/impact",
                    "step4": "Conversion rate assumption: 8-12% of checklist users sign up"
                },
                "growthModel": {
                    "month1": {"visits": 5000, "signups": 400, "assumption": "SEO + early shares"},
                    "month3": {"visits": 15000, "signups": 1500, "assumption": "Organic ranking improves"},
                    "month6": {"visits": 35000, "signups": 3500, "assumption": "Becomes reference in Reddit/communities"},
                    "month12": {"visits": 80000, "signups": 7200, "assumption": "Branded searches + consistent sharing"}
                }
            }
        }
    },
    {
        "id": "logged-out-experience",
        "title": "Logged-Out Web Experience That Earns Traffic",
        "category": "Organic Growth",
        "description": "Design and build a logged-out web experience that ranks or spreads organically, is not a blog, and naturally funnels users toward Heidi.",
        "requirements": [
            "Identify an adjacent problem clinicians have (not 'AI scribing' directly)",
            "Design a logged-out experience that solves part of that problem",
            "Show how it would attract traffic",
            "A live page, prototype, or clickable demo",
            "A simple conversion path from experience → signup"
        ],
        "solution": {
            "type": "web-tool",
            "data": {
                "tool": "Medical Note Templates Library",
                "adjacentProblem": "Clinicians struggle with note consistency and compliance across different specialties",
                "toolFunction": "Free library of evidence-based, specialty-specific note templates (GP, psychiatrist, physiotherapist, etc.)",
                "discoveryMechanism": {
                    "search": "Clinicians search: 'SOAP note template', 'psychiatry note format', 'PT documentation'",
                    "social": "Shared in physician groups, residency programs, allied health communities"
                },
                "conversionPath": [
                    "User finds template via Google search",
                    "User browses 5-10 related templates",
                    "CTA: 'Auto-generate these templates with AI' → Heidi signup",
                    "Permission gates: free templates, premium = AI-assisted generation"
                ],
                "demoRoute": "/tools/note-templates",
                "expectedTraffic": "25,000-40,000 monthly visits from organic search",
                "conversionRate": "5-8% → 1,250-3,200 signups/month",
                "compoundingEffect": "Backlinks from medical education sites, template sharing in clinical forums"
            }
        }
    },
    {
        "id": "growth-ai-enablement",
        "title": "10× a Growth Function with AI",
        "category": "Growth & Product",
        "description": "Pick one growth function at Heidi and build an AI-powered tool that makes it at least 10× faster or more effective.",
        "requirements": [
            "A working prototype (tool, agent, automation, or app)",
            "A clear before/after comparison of the workflow",
            "A short demo or walkthrough",
            "An explanation of how this would be adopted by the team"
        ],
        "solution": {
            "type": "ai-tool",
            "data": {
                "targetFunction": "CRO (Conversion Rate Optimization) & A/B Testing",
                "problem": "Growth team currently: manually analyzes user feedback, designs experiments slowly, writes test copy variationsmanually",
                "solution": "AI Agent that: reads session recordings & feedback → suggests tests → generates copy → tracks results → recommends next tests",
                "demoRoute": "/tools/growth-ai-studio",
                "beforeAfter": {
                    "before": {
                        "timeToTestHypothesis": "5-7 days",
                        "copyVariations": "2-3 per test",
                        "insightDiscovery": "Manual review of 50+ recordings",
                        "bottleneck": "Creative writing + hypothesis formation"
                    },
                    "after": {
                        "timeToTestHypothesis": "4-6 hours",
                        "copyVariations": "8-12 per test",
                        "insightDiscovery": "Automated clustering of user issues",
                        "improvement": "15-20x faster test velocity"
                    }
                },
                "workflow": [
                    "1. Agent ingests: session recordings, support tickets, user feedback",
                    "2. Agent identifies: conversion blockers, objection patterns, user behavior clusters",
                    "3. Agent suggests: 3-5 test hypotheses with copy variations",
                    "4. Human approves: selects hypothesis, reviews copy for brand fit",
                    "5. Agent runs: test setup, tracking, statistical significance monitoring",
                    "6. Agent reports: results + next recommended tests"
                ]
            }
        }
    },
    {
        "id": "brand-sponsorship",
        "title": "Brand Sponsorship Strategy",
        "category": "Brand & Communications",
        "description": "Develop a sponsorship strategy that helps Heidi become the most loved AI Care Partner among highly educated healthcare professionals.",
        "requirements": [
            "Choose a passion space where your target audience spends time as humans, not clinicians",
            "Design 2-3 specific sponsorship ideas within those passion spaces",
            "Outline activation ideas 'beyond the game'",
            "Clear thinking about how to resonate with the consumer"
        ],
        "solution": {
            "type": "brand-strategy",
            "data": {
                "country": "United Kingdom",
                "passionSpace": "Marathon Running & Endurance Sports",
                "rationale": "Clinicians are high-achievers who value precision, discipline, and pushing boundaries. Marathon training embodies all of this. Running communities are tight-knit and trust-based—perfect for seeding Heidi as 'the AI partner for the exhausted clinician.'",
                "sponsorships": [
                    {
                        "name": "Marathon Finish Line Wellness Tent",
                        "concept": "Post-race recovery stations staffed by physical therapists using Heidi; recovery data captured, runners learn about clinician burnout parallels",
                        "activation": "LinkedIn campaign: 'Clinicians who run marathons know exhaustion. Heidi eliminates the invisible marathon of admin work.'",
                        "reach": "5,000 elite runners, 70% in healthcare professions"
                    },
                    {
                        "name": "Running Podcast Series Sponsorship",
                        "concept": "Interview clinicians who are also ultra-runners; discuss burnout, time management, precision",
                        "activation": "Branded content: 'The Clinician Runner' series shared across medical communities",
                        "reach": "50,000+ monthly listeners, 40% healthcare professionals"
                    },
                    {
                        "name": "Running App Integration (Strava)",
                        "concept": "Heidi co-brands with running community; feature: 'Your running splits are precise. Your charting should be too.'",
                        "activation": "Micro-targeted ads to doctors in running groups + organic community growth",
                        "reach": "High-intent audience: healthcare professionals in fitness communities"
                    }
                ]
            }
        }
    },
    {
        "id": "lifecycle-system",
        "title": "Lifecycle System That Moves Metrics",
        "category": "Lifecycle & Growth",
        "description": "Design and demonstrate a lifecycle system that meaningfully impacts metrics like free → paid conversion, activation, or retention.",
        "requirements": [
            "Lifecycle architecture: segments, behavioral triggers, channels",
            "Real message assets + in-product mock ups",
            "Trigger logic (no calendar-only campaigns)",
            "A measurement framework that goes beyond opens and clicks"
        ],
        "solution": {
            "type": "lifecycle-system",
            "data": {
                "focusMetrics": ["Free → Paid Conversion", "Time to First Value", "Activation"],
                "demoRoute": "/tools/lifecycle-simulator",
                "segments": [
                    {
                        "name": "Power User",
                        "criteria": "Completes 20+ notes, uses 3+ features, logs in 5+ days/week",
                        "trigger": "Day 7 of usage",
                        "message": "You're getting real value. Upgrade to unlock team collaboration.",
                        "channel": "In-app + Email"
                    },
                    {
                        "name": "Struggling User",
                        "criteria": "Completes 0-5 notes, bounces after 2-3 logins",
                        "trigger": "Day 3 of low engagement",
                        "message": "We noticed you haven't tried templates yet. Here's a quick win.",
                        "channel": "In-app modal + Slack notification"
                    },
                    {
                        "name": "Feature Explorer",
                        "criteria": "Tries multiple features, low usage volume",
                        "trigger": "Feature X usage",
                        "message": "You explored AI summaries. Here's how teams use it for faster approvals.",
                        "channel": "Email + In-app"
                    }
                ],
                "conversionFlow": {
                    "step1": "User activated (first note completed)",
                    "step2": "Offer value: templates, time savings, compliance features",
                    "step3": "Friction removal: free trial for team features",
                    "step4": "Social proof: show peer usage, ROI calculator",
                    "step5": "Upgrade offer: timing based on engagement, not calendar"
                },
                "measurement": {
                    "leadingIndicators": ["Time to first note", "Feature adoption rate", "Days to 10 notes"],
                    "laggingIndicators": ["Free → Paid conversion rate", "LTV", "Expansion revenue"],
                    "cohortTracking": "Compare conversion rates by segment to measure campaign impact"
                }
            }
        }
    },
    {
        "id": "incentive-design",
        "title": "Incentive Design Under Adversarial Conditions (Kinetic)",
        "category": "Product & Operations",
        "description": "Design a system that makes information sharing a selfish, rational decision for competing physiotherapy clinics — even when they are competitors.",
        "requirements": [
            "A clickable or runnable prototype showing opt-in/opt-out behavior",
            "What information is shared and when",
            "How incentives are created and reinforced",
            "Explanation of how this scales from 19% → 80%"
        ],
        "solution": {
            "type": "product-system",
            "data": {
                "problem": "Only 19% of PT clinics want to share patient history, despite 71% wanting to receive it",
                "solution": "Reputation + Revenue Sharing System",
                "demoRoute": "/tools/kinetic-incentives",
                "mechanics": [
                    {
                        "mechanism": "Reputation Score (Public Profile)",
                        "logic": "Clinics that share treatment notes earn visible credibility (like Airbnb reviews). Specialists/experienced practitioners are marked as 'trusted referral partners.'",
                        "incentive": "New patient referrals flow to high-reputation clinics"
                    },
                    {
                        "mechanism": "Revenue Share on Successful Referrals",
                        "logic": "If a clinic refers a patient and that patient books at the receiving clinic, the referring clinic gets 5-10% of that first visit revenue",
                        "incentive": "Sharing = direct financial upside"
                    },
                    {
                        "mechanism": "Safety Guarantees",
                        "logic": "Notes are read-only and timestamped. Clinics see exactly when and by whom their data was accessed. Audit trail prevents liability concerns.",
                        "incentive": "Removes fear of misuse or judgment"
                    },
                    {
                        "mechanism": "Competitive Analysis",
                        "logic": "Clinics see: 'Clinics in your area with shared profiles get 40% more referrals.' Social proof drives adoption.",
                        "incentive": "FOMO drives adoption"
                    }
                ],
                "prototypePath": [
                    "1. Clinic signs up, sees opt-in screen",
                    "2. Shows 'Sharing benefits' (reputation, revenue, referrals)",
                    "3. Shows 'Safety controls' (read-only, audit trail, what can be hidden)",
                    "4. After opt-in: dashboard shows reputation score, referrals received, revenue earned"
                ],
                "scalingPlan": {
                    "phase1": "19% → 40% (reputation system launch, early adopter incentives)",
                    "phase2": "40% → 60% (revenue share + case studies of successful clinics)",
                    "phase3": "60% → 80% (network effects: clinics see other clinics thriving)"
                }
            }
        }
    },
    {
        "id": "referral-infrastructure",
        "title": "Referral Infrastructure That Actually Converts (Pathway)",
        "category": "Product & UX",
        "description": "Redesign the referral system to materially increase booked rate and make the experience feel like continuity of care, not a cold handoff.",
        "requirements": [
            "Working end-to-end prototype covering referring practitioner, patient, and receiving practitioner flows",
            "Walkthrough showing where drop-off is reduced",
            "How context is preserved and loop is closed",
            "Rationale for why this changes behavior, not just tracking"
        ],
        "solution": {
            "type": "product-redesign",
            "data": {
                "currentState": {
                    "bookedRate": "41%",
                    "issues": ["Patient feels abandoned", "Context lost between practitioners", "No automated follow-up", "Silent failures"]
                },
                "demoRoute": "/tools/pathway-referrals",
                "newFlow": [
                    {
                        "step": "Referral Creation",
                        "actor": "Referring Practitioner",
                        "action": "Creates referral with specific context: 'Needs mobility assessment for knee', includes patient goals, clinical notes (read-only)"
                    },
                    {
                        "step": "Patient Notification",
                        "actor": "System",
                        "action": "SMS + Email: 'Your physio referred you to XYZ for continued care. 1-tap to book with them.'",
                        "frictionReduction": "1-tap booking instead of searching/calling"
                    },
                    {
                        "step": "Booking",
                        "actor": "Patient",
                        "action": "1-tap confirmation; appointment confirmed instantly"
                    },
                    {
                        "step": "Receiving Practitioner Prep",
                        "actor": "System",
                        "action": "Receiving practitioner sees referral context 24h before appointment; can review history",
                        "continuity": "No need to re-assess basics"
                    },
                    {
                        "step": "Post-Visit Loop",
                        "actor": "Receiving Practitioner",
                        "action": "Sends brief update to referring practitioner (with patient consent); closes the loop",
                        "trust": "Transparency + collaboration signal"
                    }
                ],
                "expectedImpact": {
                    "bookedRateTarget": "65-70%",
                    "rationale": "1-tap reduces friction by 80%; context preservation + loop closure increases perceived continuity"
                }
            }
        }
    },
    {
        "id": "shared-patient-summary",
        "title": "Shared Patient Summary Without Creating Liability (Capsule)",
        "category": "Product & Legal",
        "description": "Design and prototype the information architecture and permission model for a shared Patient Summary that is genuinely useful, clinically safe, and low overhead.",
        "requirements": [
            "Working prototype showing what data appears in summary, how visibility differs by role",
            "Clear data model: what is summarized, what is excluded, who controls visibility",
            "Example summaries as seen by different practitioners",
            "Explanation of how this avoids CYA note inflation"
        ],
        "solution": {
            "type": "product-architecture",
            "data": {
                "architecture": "Structured, Role-Based Summaries",
                "demoRoute": "/tools/capsule-summary",
                "dataModel": {
                    "includedInSummary": [
                        {
                            "field": "Allergies & Contraindications",
                            "visible_to": "All practitioners",
                            "format": "Structured (dropdown)"
                        },
                        {
                            "field": "Active Diagnoses",
                            "visible_to": "All practitioners (redacted by role)",
                            "format": "ICD-10 code + patient-friendly name"
                        },
                        {
                            "field": "Active Treatments",
                            "visible_to": "All practitioners",
                            "format": "Medication list, therapy type"
                        },
                        {
                            "field": "Last 3 Clinical Summaries",
                            "visible_to": "Relevant practitioners only (e.g., GP sees physio summary, not mental health details)",
                            "format": "2-3 sentence objective summary (not full notes)"
                        }
                    ],
                    "excludedFromSummary": [
                        "Full clinical notes (privacy)",
                        "Mental health details (unless explicitly shared)",
                        "Clinician judgments or informal language",
                        "Billing/administrative notes"
                    ]
                },
                "permissionModel": {
                    "gpView": ["Allergies", "Diagnoses", "Active treatments", "Recent summaries from allied health"],
                    "physioView": ["Allergies", "Diagnoses related to musculoskeletal", "Relevant treatment history"],
                    "psychologistView": ["Allergies", "Diagnoses related to mental health", "Medication history"]
                },
                "safetyMechanisms": [
                    "Summaries are auto-generated from structured data, not copy-paste from notes",
                    "Removes liability-inducing language ('I'm worried about X' → 'Monitor for X')",
                    "Audit log: every view is logged with timestamp and access reason",
                    "Patient consent: patient explicitly chooses what to share and with whom",
                    "Opt-out by practitioner: any practitioner can request data be hidden from specific colleagues"
                ]
            }
        }
    },
    {
        "id": "self-serve-onboarding",
        "title": "Self-Serve Onboarding for Heidi Calls (Northside Clinic)",
        "category": "Product & Implementation",
        "description": "Design and prototype a self-serve onboarding workflow that allows a clinic to configure Heidi Calls to fit their needs.",
        "requirements": [
            "Runnable/clickable prototype showing onboarding flow from clinic perspective",
            "Questions, templates, or steps used to configure the agent",
            "How different inputs lead to different call-handling behavior",
            "Walkthrough showing how this reduces onboarding from weeks to mostly self-serve"
        ],
        "solution": {
            "type": "product-flow",
            "data": {
                "currentState": "Manual onboarding takes weeks; requires back-and-forth with Heidi team",
                "newState": "Self-serve questionnaire; 80% of clinics can configure independently in 30 minutes",
                "demoRoute": "/tools/calls-onboarding",
                "onboardingFlow": [
                    {
                        "step": 1,
                        "title": "Clinic Profile",
                        "questions": ["Practice type (GP, multi-specialty, allied health)", "Number of locations", "Staff size"],
                        "output": "Determines template baseline and complexity"
                    },
                    {
                        "step": 2,
                        "title": "Call Handling Rules",
                        "section": "Business Hours",
                        "questions": ["Which doctors accept new patients?", "Which calls need approval?", "Preferred escalation path?"],
                        "output": "Call routing rules"
                    },
                    {
                        "step": 3,
                        "title": "After-Hours Behavior",
                        "questions": ["Should calls go to voicemail or nurse triage?", "Which patients get emergency access?"],
                        "output": "After-hours routing"
                    },
                    {
                        "step": 4,
                        "title": "Communication Preferences",
                        "questions": ["Tone preference (formal, friendly, clinical)?", "Any phrases to avoid?"],
                        "output": "AI prompt customization"
                    },
                    {
                        "step": 5,
                        "title": "Review & Activate",
                        "preview": "Sample call transcript using clinic's rules → clinic approves or adjusts"
                    }
                ],
                "intelligentDefaults": "System pre-fills common patterns based on clinic type; clinic edits, doesn't start from scratch",
                "expectedOutcome": "From weeks → 30-minute setup; 20% manual support for edge cases"
            }
        }
    },
    {
        "id": "intelligent-voicemail",
        "title": "Intelligent Voicemail System (Harbour to Sunset GP)",
        "category": "Product & Operations",
        "description": "Design a system that transforms voicemail from a chaos source into a prioritized, actionable queue for admin staff.",
        "requirements": [
            "Working prototype showing voicemail processing pipeline",
            "How system prioritizes and summarizes messages",
            "How admin staff act on voicemail efficiently",
            "Expected impact on staff productivity and patient response time"
        ],
        "solution": {
            "type": "product-system",
            "data": {
                "currentProblem": "Dozens of voicemails every morning; no clear sense of urgency; staff behind before day starts",
                "newSystem": "AI-powered voicemail triage with auto-summarization and prioritization",
                "demoRoute": "/tools/voicemail-triage",
                "pipeline": [
                    {
                        "step": "Recording Capture",
                        "action": "Voicemail captured and transcribed in real-time"
                    },
                    {
                        "step": "AI Classification",
                        "classifies": [
                            "Priority: Urgent (acute symptoms, follow-up critical), High (appointment/prescription), Normal (general inquiry)",
                            "Type: New patient, Existing patient, Prescription refill, Appointment change, Lab result follow-up, Referral",
                            "Practitioner: Routes to relevant doctor/specialty"
                        ]
                    },
                    {
                        "step": "Auto-Summary & CTA",
                        "generates": "1-sentence summary + suggested next action (e.g., 'Call back', 'Schedule appointment', 'Send lab result')"
                    },
                    {
                        "step": "Dashboard Queue",
                        "displays": "Sorted by priority; admin staff work top-to-bottom; one click to call patient back"
                    },
                    {
                        "step": "Closure Loop",
                        "tracks": "When admin calls patient back, marks voicemail as resolved; logs action for compliance"
                    }
                ],
                "impact": {
                    "timePerVoicemail": "Before: 2-3 min to listen + understand; After: 10 seconds to read summary + click 'call back'",
                    "staffProductivity": "15x faster voicemail triage; staff can clear queue in 20 min instead of 2 hours",
                    "patientExperience": "Response time: 2-4 hours instead of next business day"
                }
            }
        }
    },
    {
        "id": "copywriter-campaign",
        "title": "Brand Campaign: Copywriter Challenge",
        "category": "Brand & Messaging",
        "description": "Develop a brand campaign that helps Heidi become the most loved AI Care Partner among healthcare professionals.",
        "requirements": [
            "Choose an insight to underpin campaign (afterhours work, computer in the room, or note-taking style)",
            "Craft big idea with clear rationale",
            "2-3 taglines for billboard/landing page",
            "200-300 word manifesto for clinicians"
        ],
        "solution": {
            "type": "brand-campaign",
            "data": {
                "selectedInsight": "The Computer in the Room",
                "rationale": "Clinicians want to see patients; the EHR forces them to see a screen instead. This is visceral and relatable—Heidi should position itself as removing the computer from the equation.",
                "bigIdea": "Heidi puts you back in the room with your patients.",
                "bigIdeaExplanation": "Instead of talking about what Heidi does (scribing), we talk about what clinicians want (patient focus). Heidi is the tool that makes the computer invisible. The campaign positions Heidi not as a product, but as an enabler of human care.",
                "taglines": [
                    "Your notes don't have to cost you your patient.",
                    "The AI that knows when to be quiet.",
                    "Focus on the patient. We'll handle the paperwork."
                ],
                "manifesto": "Manifesto: In Modern Medicine, There Are Three Entities\n\nYou, your patient, and a computer. For too long, the computer wins. It demands your attention, your clicks, your focus. Clinicians spend hours after hours doing invisible work—data entry, formatting, compliance checkboxes. Work that doesn't heal anyone.\n\nHeidi is different. We're not another tool demanding your attention. We're the tool that gets out of the way. We listen to your patient, we understand your specialty, we write your notes the way you would—so you can keep doing what matters: being present, asking the right questions, making the decisions only you can make.\n\nHeidi isn't a scribe. It's your advocate in the room. It's proof that AI in healthcare should amplify human connection, not replace it. That technology should serve clinicians, not the other way around.\n\nYou became a clinician to care for people. Heidi makes sure that's what you spend your time on."
            }
        }
    },
    {
        "id": "product-marketing-launch",
        "title": "Product Marketing: Templates Feature Launch",
        "category": "Product Marketing",
        "description": "Create a launch plan for a new Heidi Templates upgrade feature (easier creation, version history, chat requests).",
        "requirements": [
            "Define audience + problem (max 8 lines)",
            "Positioning + key message",
            "2 launch assets (email, in-app, help center, or talk track)",
            "Channel plan and timeline",
            "Success metrics + risks"
        ],
        "solution": {
            "type": "launch-plan",
            "data": {
                "audience": "Clinic Admin / Template Manager",
                "jobToBeDone": "Create and maintain templates that clinicians will actually use, without fear of breaking working processes",
                "currentFrustration": "Creating templates is cumbersome; editing is scary (breaks workflows); no way to learn from past versions or iterate safely",
                "positioning": "Template Builder: Confident, iterative template management for admins who own clinic workflows.",
                "messagesPillars": [
                    "Pillar 1: Control - You have full visibility and can revert any change instantly",
                    "Pillar 2: Collaboration - Ask for feedback without giving away control (chat requests)",
                    "Pillar 3: Confidence - Edit templates without fear of breaking workflows"
                ],
                "launchAssets": {
                    "asset1": {
                        "type": "Email Campaign",
                        "subject": "You can now edit templates without the fear",
                        "body": "Hi [Clinic Name], we heard from your team: editing templates felt risky. We built confidence back in. New: version history, collaborative editing, instant rollback.",
                        "cta": "See what's new in Templates"
                    },
                    "asset2": {
                        "type": "In-App Modal",
                        "headline": "Templates just got smarter",
                        "body": "Edit with confidence. Revert instantly. Collaborate safely.",
                        "cta": "Learn more"
                    }
                },
                "channelPlan": {
                    "day0": ["In-app banner", "Product update page"],
                    "week1": ["Email to admins", "CS teams notified", "Sales talk track released"],
                    "week2": ["Community post", "Help center updated", "Webinar for existing customers"]
                },
                "successMetrics": [
                    "Adoption: % of clinics enabling version history within 14 days",
                    "Usage: average templates edited per clinic (trend up = confidence increase)",
                    "Support: reduction in 'how do I revert' support tickets"
                ],
                "risks": [
                    {
                        "risk": "Low feature awareness (admins don't know it exists)",
                        "mitigation": "In-app notification + email; CS team mentions in check-in calls"
                    },
                    {
                        "risk": "Feature too complex for non-technical admins",
                        "mitigation": "Simple 2-min walkthrough video; offer onboarding call for enterprise customers"
                    }
                ]
            }
        }
    },
    {
        "id": "comms-ai-strategy",
        "title": "Communications AI Strategy",
        "category": "Communications & Strategy",
        "description": "Develop an AI strategy that enables Heidi to run a clear, consistent, and scalable global communications function.",
        "requirements": [
            "Identify 1-2 core communication challenges as a global company",
            "Design 2-3 strategic applications of AI",
            "Explain how strategy supports internal teams and PR agency partners",
            "Outline governance, risk management, and trust safeguards"
        ],
        "solution": {
            "type": "strategy",
            "data": {
                "coreChallenges": [
                    {
                        "challenge": "Message Consistency Across Markets",
                        "impact": "Agencies in different regions interpret brand messaging differently; inconsistent positioning weakens brand perception globally"
                    },
                    {
                        "challenge": "Speed vs. Accuracy in Global Updates",
                        "impact": "Manual monthly updates to Impact Hub create lag; agencies work from stale data; real-time changes aren't communicated consistently"
                    }
                ],
                "aiStrategy": [
                    {
                        "application": "AI Message Framework Generator",
                        "input": "Core message + market context (e.g., region, audience, campaign goal)",
                        "output": "3-5 localized message variations aligned to brand voice, with market-specific nuance",
                        "impact": "Agencies get message guardrails + flexibility; faster time to campaign launch; consistency preserved"
                    },
                    {
                        "application": "Automated Impact Hub Updates",
                        "input": "Real-time business metrics (signups, features shipped, funding announcements)",
                        "output": "Live dashboard + weekly email summary to agencies with key changes highlighted",
                        "impact": "Agencies always work from current data; reduces async back-and-forth"
                    },
                    {
                        "application": "AI Narrative Assistant",
                        "input": "Product announcement + target audience",
                        "output": "Story angle, key points, suggested media hooks, talking points for executives",
                        "impact": "Teams move from 'what should we say?' to 'how do we refine this narrative?' 10x faster"
                    }
                ],
                "governance": {
                    "keyRisk": "Over-automation: AI-generated messages lack human judgment about brand nuance, cultural sensitivity, or strategic timing",
                    "safeguards": [
                        "AI generates options; humans approve messaging before agency distribution",
                        "Monthly brand audit: review AI-generated messages for drift from core positioning",
                        "Agency feedback loop: agencies flag messages that felt off-brand or ineffective"
                    ]
                }
            }
        }
    }
]

def get_all_challenges():
    """Return all challenges"""
    return CHALLENGES

def get_challenge_by_id(challenge_id):
    """Get a specific challenge by ID"""
    for ch in CHALLENGES:
        if ch['id'] == challenge_id:
            return ch
    return None
