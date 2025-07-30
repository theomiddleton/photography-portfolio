import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface UsageAlertEmailProps {
  bucketName: string
  usageBytes: number
  maxBytes: number
  usagePercent: number
  alertType: 'warning' | 'critical'
  objectCount: number
  formattedUsage: string
  formattedMax: string
}

export const UsageAlertEmail = ({
  bucketName,
  usagePercent,
  alertType,
  objectCount,
  formattedUsage,
  formattedMax,
}: UsageAlertEmailProps) => {
  const previewText = `${alertType === 'critical' ? 'CRITICAL' : 'WARNING'}: ${bucketName} storage at ${usagePercent}%`
  
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Heading className={`text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0 ${
                alertType === 'critical' ? 'text-red-600' : 'text-orange-600'
              }`}>
                {alertType === 'critical' ? '🚨 CRITICAL STORAGE ALERT' : '⚠️ STORAGE WARNING'}
              </Heading>
            </Section>
            
            <Text className="text-black text-[14px] leading-[24px]">
              Your <strong>{bucketName}</strong> bucket has reached <strong>{usagePercent}%</strong> of the free tier limit.
            </Text>
            
            <Section className="bg-gray-50 p-4 rounded-lg my-4">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Usage Details:</strong>
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                • Current Usage: {formattedUsage}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                • Free Tier Limit: {formattedMax}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                • Object Count: {objectCount.toLocaleString()} files
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                • Usage Percentage: {usagePercent}%
              </Text>
            </Section>

            {alertType === 'critical' && (
              <Section className="bg-red-50 border border-red-200 p-4 rounded-lg my-4">
                <Text className="text-red-800 text-[14px] leading-[24px] m-0 font-semibold">
                  ⚠️ Immediate Action Required
                </Text>
                <Text className="text-red-700 text-[14px] leading-[24px] m-0">
                  You are very close to exceeding the free 10GB Cloudflare R2 storage limit. 
                  Additional usage may result in charges.
                </Text>
              </Section>
            )}

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Recommended Actions:</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              1. Review and delete unused files<br/>
              2. Use the deduplication tool to find and remove duplicate files<br/>
              3. Consider archiving old content<br/>
              4. Monitor usage more frequently
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Link
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3 inline-block"
                href={`${process.env.SITE_URL}/admin/storage-alerts`}
              >
                View Storage Dashboard
              </Link>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              This alert was generated automatically by your portfolio storage monitoring system.
            </Text>
            
            <Text className="text-gray-400 text-[12px] leading-[24px]">
              Timestamp: {new Date().toISOString()}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}