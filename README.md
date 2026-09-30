# ITS-Academix AI — app + AI (bina Claude ke)

## Option A: Vercel pe deploy (sabse best — link kholte hi AI chalega, kisi ko key nahi chahiye)
1. Free Gemini key lo: https://aistudio.google.com/apikey  (ya Claude key: https://console.anthropic.com)
2. Is folder ko GitHub repo me daalo, phir vercel.com -> New Project -> repo import karo.
3. Project Settings -> Environment Variables me `GEMINI_API_KEY` = tumhari key (ya `ANTHROPIC_API_KEY`). Redeploy karo.
4. Vercel ka link Chrome / phone me kholo. AI chalega.

Dhyan: link jiske paas hoga wo tumhari key pe AI use karega. Gemini free tier me limits hain (AI Studio dashboard me dikhti hain), Claude key paid hoti hai — spend limit lagana.

## Option B: Sirf static hosting (koi server nahi)
Folder ko Netlify Drop / GitHub Pages / kahin bhi upload karo. App kholke Home -> "⚙️ AI" me apni key paste karo (Save -> Test). Key sirf us browser me rehti hai.

## App ki tarah install karna
- Android (Chrome): link kholo -> "📲 Install" button (Home pe) ya menu -> Install app.
- iPhone (Safari): Share -> Add to Home Screen.
- APK chahiye: https://www.pwabuilder.com pe apna link daalo -> Android package download.
