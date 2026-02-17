import Image from "next/image"

export default function AuthLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 py-6'>
			<div className='w-full max-w-md'>
				<div className='mb-8 flex flex-col items-center gap-2'>
					<Image
						src='/logo.svg'
						alt='eufaço!'
						width={320}
						height={120}
						className='h-25 w-auto'
						priority
					/>
				</div>
				{children}
			</div>
		</div>
	)
}
