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
						src='/logo.png'
						alt='ResolveAí'
						width={300}
						height={80}
						className='h-20 w-auto'
						priority
					/>
				</div>
				{children}
			</div>
		</div>
	)
}
