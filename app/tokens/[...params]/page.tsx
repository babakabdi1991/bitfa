import { getTokenDescription, searchToken } from "@/services/http/token.http";
import { Metadata } from "next";
import TokenPage from "@/components/features/token/TokenPage";
import { formatNumberToSubscript } from "@/utils/PriceFormatter";
import TokenAccordion from "@/components/features/token/TokenAccordion";
import HiddenElementForSeo from "@/components/common/HiddenElementForSeo";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import HowToUse from "@/components/features/followed-wallets/HowToUse";
import { TOKEN_PAGE_PARAMS } from "@/utils/pageParams";
import { minifyContract } from "@/utils/truncate";
import { Suspense } from "react";

interface Props {
  params: IParam;
  searchParams: searchParams;
}

type IParam = {
  params: [string, string];
};

type searchParams = {
  network: string;
};

// Helper function to generate a dynamic alt text
function generateAltText(
  tokenName: string,
  dexPlatform: string,
  blockchain: string,
  tokenPrice: string,
  formattedPriceChange: string,
  tokenId: string,
  tokenAddress: string
): string {
  const baseParagraph = `The token ${tokenName} is trading at a price of $${tokenPrice}. You can buy and sell it on the ${dexPlatform} platform. It is also being listed with the address ${tokenAddress} on the ${dexPlatform} trading exchange. This token is on the ${blockchain} network and is deployed on a decentralized blockchain. The project behind ${tokenName} aims to enhance trading and freedom. Its price and chart are available on the trading platform. This decentralized finance token makes it easy for the community to grow and have an effect. ${tokenName} has a price change of ${formattedPriceChange} in the last 24 hours and is known by the id ${tokenId}.`;

  const simpleFiller = `This token is easy to understand and use. Many people trade it every day. The market is simple and friendly. You can quickly buy and sell the token without any trouble. The design of the platform is clear, and the price information is easy to read. People like to use the token because it is safe and secure. It is built with a simple idea in mind: to make trading fun and free. The technology behind the token is made for everyone. The trading experience is straightforward and fair. Every trade is recorded on the blockchain, so all the information is clear. The token shows a steady price on the chart. You can check the price anytime on the trading platform. The exchange works fast, and you can see every update as it happens. The network is strong and reliable. It makes the trading process smooth and simple. Many new users join every day because the system is easy to learn. The token is a good example of decentralized finance. It helps the community grow and supports freedom in trading. The people who use the token feel that they are part of something simple and honest. Every transaction is safe, and all the details are visible. The token makes it easy to be part of the market. With clear instructions and a friendly design, even beginners can trade without fear. The simple words on the website show how to buy, sell, and check the price.`;

  const enrichedFiller = simpleFiller
    .replace(/this token/gi, tokenName)
    .replace(/the token/gi, tokenName);

  return `${baseParagraph} ${enrichedFiller}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await searchToken({
      params: {
        currencyAddress: params.params[1],
      },
    });

    const tokenData = data?.data?.[0];
    const tokenName = tokenData?.attributes?.name || "Unknown Token";
    const shortTokenName = tokenName.trim().split("/")[0];
    const tokenPrice = parseFloat(
      tokenData?.attributes?.base_token_price_usd || "0"
    ).toFixed(15);
    const dexPlatform =
      tokenData?.relationships?.dex?.data?.id || "unknown platform";
    const tokenId = tokenData?.id || "N/A";
    const blockchain = tokenId.split("_")[0] || "unknown blockchain";
    const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/tokens/${params.params[0]}/${params.params[1]}`;

    const priceChange24h =
      tokenData?.attributes?.price_change_percentage?.h24 || "0";
    const formattedPriceChange = parseFloat(priceChange24h).toFixed(2) + "%";

    let imageUrl =
      tokenData?.imageUrl2 ||
      `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`;
    if (imageUrl.startsWith("/")) {
      imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}${imageUrl}`;
    }

    const altText = generateAltText(
      tokenName,
      dexPlatform,
      blockchain,
      tokenPrice,
      formattedPriceChange,
      tokenId,
      params.params[1]
    );

    const title = `${shortTokenName} Token | $${formatNumberToSubscript(
      +tokenPrice
    )} | ${blockchain} DEX Trading ${dexPlatform}`;

    const description = `${shortTokenName} on ${dexPlatform} (${blockchain}) is trading at $${tokenPrice} with a price change of ${formattedPriceChange}. Access chart analysis, trade activity, and top dextraders.`;

    return {
      title,
      description,
      keywords: `${tokenName.toLowerCase()}, ${tokenName} live price, ${blockchain} DEX trading, ${dexPlatform}, live chart analysis, price prediction, how to buy ${tokenName}, liquidity analysis, scoring system, security checker, holder analysis`,
      alternates: {
        canonical: pageUrl,
        languages: {
          "en-US": pageUrl,
        },
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: pageUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: altText,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@dextrading",
        creator: "@dextrading",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "dex trading | Explore Crypto Tokens",
      description:
        "Discover real-time crypto insights with dex trading. Explore token prices, liquidity, and scores with advanced analytics.",
      keywords:
        "dex trading, crypto insights, cryptocurrency, token analysis, blockchain",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}`,
      },
      openGraph: {
        title: "dex trading | Explore Crypto Tokens",
        description:
          "Discover real-time crypto insights with dex trading. Explore token prices, liquidity, and scores with advanced analytics.",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}`,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`,
            width: 1200,
            height: 630,
            alt: "Dex Trading offers comprehensive cryptocurrency insights including live token prices, dynamic chart analysis, and in-depth market trends.",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@dextrading",
        title: "dex trading | Explore Crypto Tokens",
        description:
          "Discover real-time crypto insights with dex trading. Explore token prices, liquidity, and scores with advanced analytics.",
        images: [`${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`],
      },
    };
  }
}

// NEW: Server-side data fetching for SEO
async function getTokenData(tokenAddress: string) {
  try {
    const searchedToken = await searchToken({
      params: {
        currencyAddress: tokenAddress,
      },
    });
    return searchedToken;
  } catch (error) {
    console.error("Error fetching token data:", error);
    return null;
  }
}

async function getTokenDescriptionData(tokenAddress: string) {
  try {
    const tokenDescription = await getTokenDescription(tokenAddress);
    return tokenDescription;
  } catch (error) {
    console.error("Error fetching token description:", error);
    return null;
  }
}

// NEW: SEO-friendly content component (Server Component)
function TokenSEOContent({ 
  tokenData, 
  tokenDescription, 
  params 
}: { 
  tokenData: any; 
  tokenDescription: any; 
  params: [string, string];
}) {
  const token = tokenData?.data?.[0];
  
  // Always render content, even if token data is missing
  const tokenName = token?.attributes?.name || "Cryptocurrency Token";
  const shortTokenName = tokenName.trim().split("/")[0];
  const tokenPrice = token?.attributes?.base_token_price_usd 
    ? parseFloat(token.attributes.base_token_price_usd).toFixed(10)
    : "0.00";
  const liquidity = token?.attributes?.reserve_in_usd 
    ? parseFloat(token.attributes.reserve_in_usd).toFixed(2)
    : "0.00";
  const priceChange24h = token?.attributes?.price_change_percentage?.h24 || "0";
  const formattedPriceChange = parseFloat(priceChange24h).toFixed(2) + "%";
  const dexPlatform = token?.relationships?.dex?.data?.id || "decentralized exchange";
  const blockchain = token?.id?.split("_")[0] || params[0] || "blockchain";

  return (
    <article itemScope itemType="https://schema.org/FinancialProduct" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
        <meta itemProp="price" content={tokenPrice} />
        <meta itemProp="priceCurrency" content="USD" />
      </div>

      <h2 itemProp="name" style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        {shortTokenName} Token Overview and Trading Information
      </h2>
      
      <p itemProp="description" style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        {shortTokenName} is a cryptocurrency token trading on the {blockchain} blockchain 
        via the {dexPlatform} decentralized exchange. Current price is ${tokenPrice} USD 
        with a 24-hour price change of {formattedPriceChange}. The token has a liquidity 
        pool of ${liquidity} USD. This token is available for trading on decentralized exchanges 
        and provides users with access to decentralized finance opportunities.
      </p>

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Token Metrics and Statistics
        </h3>
        <p style={{ marginBottom: '0.5rem' }}>
          Current Price: ${tokenPrice} USD. 24-Hour Price Change: {formattedPriceChange}. 
          Liquidity: ${liquidity} USD. Blockchain Network: {blockchain}. 
          Trading Platform: {dexPlatform}. Contract Address: {params[1]}.
        </p>
      </section>

      {tokenDescription?.data?.data?.content && (
        <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            About {shortTokenName}
          </h3>
          <div 
            style={{ lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ 
              __html: tokenDescription.data.data.content 
            }} 
          />
        </section>
      )}

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          How to Trade {shortTokenName}
        </h3>
        <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
          You can trade {shortTokenName} on the {dexPlatform} decentralized exchange 
          platform. The token operates on the {blockchain} network, providing fast 
          and secure transactions. Trading is available 24/7 with real-time price 
          updates and liquidity information. Users can connect their wallets and start 
          trading immediately on the platform.
        </p>
        
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
          Trading Features
        </h4>
        <p style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>
          Real-time price charts and technical analysis. 24-hour trading volume tracking. 
          Liquidity pool information. Token holder statistics and distribution. Security 
          audit and safety scores. Market depth and order book data. Historical price data 
          and trend analysis. Token contract verification and security checks.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          {shortTokenName} Market Analysis
        </h3>
        <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
          The {shortTokenName} token has shown a 24-hour price movement of {formattedPriceChange}. 
          This price action reflects current market sentiment and trading activity on the 
          {blockchain} blockchain. Traders can access comprehensive market data including 
          historical price charts, volume analysis, and liquidity metrics. The token's 
          performance is tracked across multiple decentralized exchanges.
        </p>
        
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
          Key Market Indicators
        </h4>
        <p style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>
          Price volatility analysis. Trading volume trends. Liquidity depth assessment. 
          Holder concentration metrics. Smart contract security verification. Market cap 
          and fully diluted valuation. Trading pair availability and liquidity pools.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Security and Safety
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          {shortTokenName} operates on the {blockchain} blockchain with transparent 
          smart contract code. All transactions are recorded on-chain and can be verified 
          through blockchain explorers. The platform provides security scores and audit 
          information to help traders make informed decisions. Users should always verify 
          contract addresses before trading.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Community and Ecosystem
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          The {shortTokenName} community actively participates in the decentralized 
          finance ecosystem. Token holders can engage in trading, liquidity provision, 
          and governance activities. The project aims to build a robust and sustainable 
          cryptocurrency ecosystem with strong community support. Decentralized exchanges 
          provide open access to trading opportunities for all participants.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Decentralized Exchange Trading
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          Decentralized exchanges like {dexPlatform} enable peer-to-peer trading without 
          intermediaries. Users maintain control of their funds through wallet connections. 
          The {blockchain} network ensures secure and transparent transactions. Trading 
          fees are typically lower than centralized exchanges, and there is no need for 
          account registration or KYC verification in most cases.
        </p>
      </section>
    </article>
  );
}

export default async function Token({ params }: Props) {
  // Fetch data server-side for SEO
  const searchedToken = await getTokenData(params.params[1]);
  const tokenDescription = await getTokenDescriptionData(params.params[1]);

  return (
    <div>
      <Breadcrumb className="mt-12 mb-4">
        <BreadcrumbList>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
          <BreadcrumbLink
            href={`/tokens/${params.params[TOKEN_PAGE_PARAMS.NETWORK]}/${
              params.params[TOKEN_PAGE_PARAMS.CONTRACT_ADDRESS]
            }`}
          >
            {minifyContract(params.params[TOKEN_PAGE_PARAMS.CONTRACT_ADDRESS])}
          </BreadcrumbLink>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-lg md:text-xl">
        ${searchedToken?.data?.[0]?.attributes?.name?.split("/")[0].toUpperCase()}{" "}
        DEX – Live {params.params[TOKEN_PAGE_PARAMS.NETWORK].toUpperCase()}{" "}
        Market Data
      </h1>

      {/* Plain text content for SEO - always visible */}
      <p style={{ marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.6' }}>
        {searchedToken?.data?.[0]?.attributes?.name?.split("/")[0] || 'Token'} is a cryptocurrency 
        token available for trading on decentralized exchanges. View real-time price data, 
        trading charts, liquidity information, and market statistics. This token operates on 
        the {params.params[TOKEN_PAGE_PARAMS.NETWORK] || 'blockchain'} network and can be traded 
        through various decentralized exchange platforms. Access comprehensive token analytics, 
        holder information, security scores, and trading history.
      </p>

      {/* SEO-friendly server-rendered content */}
      <TokenSEOContent 
        tokenData={searchedToken} 
        tokenDescription={tokenDescription}
        params={params.params}
      />

      {/* Client-side interactive components */}

      <TokenPage params={params} />


      {tokenDescription?.data?.data && (
        <>
          <TokenAccordion
            tokenImageUrl={
              searchedToken?.data?.[0]?.seoImageUrl ??
              `${process.env.NEXT_PUBLIC_BASE_URL_SEVEN}/Shot_Token.jpg`
            }
            tokenDescription={tokenDescription.data.data.content}
          />
          <HiddenElementForSeo>
            <div>{tokenDescription.data.data.content}</div>
          </HiddenElementForSeo>
        </>
      )}
      
      <HowToUse />
    </div>
  );
}
