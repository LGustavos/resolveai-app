import { writeFileSync } from "fs"
import { config } from "dotenv"

config({ path: ".env.local" })

const content = `// GERADO AUTOMATICAMENTE pelo scripts/generate-sw-env.mjs
export const swFirebaseConfig = ${JSON.stringify(
	{
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
	},
	null,
	2
)};
`

writeFileSync("src/lib/firebase/sw-env.generated.ts", content)
console.log("[generate-sw-env] Arquivo gerado com sucesso")
