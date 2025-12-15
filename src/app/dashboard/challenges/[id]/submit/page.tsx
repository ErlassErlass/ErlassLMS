
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { ChallengeEditor } from "@/components/challenge/challenge-editor"

interface ChallengeSubmitPageProps {
  params: Promise<{
    id: string
  }>
}

async function getChallenge(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId }
  })
  return challenge
}

export default async function ChallengeSubmitPage({ params }: ChallengeSubmitPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const { id } = await params
  const challenge = await getChallenge(id)
  if (!challenge) notFound()

  return <ChallengeEditor challenge={challenge} />
}
