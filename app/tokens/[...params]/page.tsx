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
  
  if (!token) return null;

  const tokenName = token?.attributes?.name || "Unknown Token";
  const shortTokenName = tokenName.trim().split("/")[0];
  const tokenPrice = parseFloat(
    token?.attributes?.base_token_price_usd || "0"
  ).toFixed(10);
  const liquidity = parseFloat(
    token?.attributes?.reserve_in_usd || "0"
  ).toFixed(2);
  const priceChange24h = token?.attributes?.price_change_percentage?.h24 || "0";
  const formattedPriceChange = parseFloat(priceChange24h).toFixed(2) + "%";
  const dexPlatform = token?.relationships?.dex?.data?.id || "unknown platform";
  const blockchain = token?.id?.split("_")[0] || "unknown blockchain";

  return (
    <div className="hidden-seo-content" style={{ position: 'absolute', left: '-9999px' }}>
      {/* Main token information for SEO */}
      <article itemScope itemType="https://schema.org/FinancialProduct">
        <h2 itemProp="name">{shortTokenName} Token Overview</h2>
        <p itemProp="description">
          {shortTokenName} is a cryptocurrency token trading on the {blockchain} blockchain 
          via the {dexPlatform} decentralized exchange. Current price is ${tokenPrice} USD 
          with a 24-hour price change of {formattedPriceChange}. The token has a liquidity 
          pool of ${liquidity} USD.
        </p>
        
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="price" content={tokenPrice} />
          <meta itemProp="priceCurrency" content="USD" />
        </div>

        {/* Token metrics */}
        <section>
          <h3>Token Metrics and Statistics</h3>
          <dl>
            <dt>Current Price</dt>
            <dd>${tokenPrice} USD</dd>
            
            <dt>24-Hour Price Change</dt>
            <dd>{formattedPriceChange}</dd>
            
            <dt>Liquidity</dt>
            <dd>${liquidity} USD</dd>
            
            <dt>Blockchain Network</dt>
            <dd>{blockchain}</dd>
            
            <dt>Trading Platform</dt>
            <dd>{dexPlatform}</dd>
            
            <dt>Contract Address</dt>
            <dd>{params[1]}</dd>
          </dl>
        </section>

        {/* Token description */}
        {tokenDescription?.data?.data?.content && (
          <section>
            <h3>About {shortTokenName}</h3>
            <div dangerouslySetInnerHTML={{ 
              __html: tokenDescription.data.data.content 
            }} />
          </section>
        )}

        {/* Trading information */}
        <section>
          <h3>How to Trade {shortTokenName}</h3>
          <p>
            You can trade {shortTokenName} on the {dexPlatform} decentralized exchange 
            platform. The token operates on the {blockchain} network, providing fast 
            and secure transactions. Trading is available 24/7 with real-time price 
            updates and liquidity information.
          </p>
          
          <h4>Trading Features</h4>
          <ul>
            <li>Real-time price charts and technical analysis</li>
            <li>24-hour trading volume tracking</li>
            <li>Liquidity pool information</li>
            <li>Token holder statistics and distribution</li>
            <li>Security audit and safety scores</li>
            <li>Market depth and order book data</li>
          </ul>
        </section>

        {/* Market analysis */}
        <section>
          <h3>{shortTokenName} Market Analysis</h3>
          <p>
            The {shortTokenName} token has shown a 24-hour price movement of {formattedPriceChange}. 
            This price action reflects current market sentiment and trading activity on the 
            {blockchain} blockchain. Traders can access comprehensive market data including 
            historical price charts, volume analysis, and liquidity metrics.
          </p>
          
          <h4>Key Market Indicators</h4>
          <ul>
            <li>Price volatility analysis</li>
            <li>Trading volume trends</li>
            <li>Liquidity depth assessment</li>
            <li>Holder concentration metrics</li>
            <li>Smart contract security verification</li>
          </ul>
        </section>

        {/* Security information */}
        <section>
          <h3>Security and Safety</h3>
          <p>
            {shortTokenName} operates on the {blockchain} blockchain with transparent 
            smart contract code. All transactions are recorded on-chain and can be verified 
            through blockchain explorers. The platform provides security scores and audit 
            information to help traders make informed decisions.
          </p>
        </section>

        {/* Community and ecosystem */}
        <section>
          <h3>Community and Ecosystem</h3>
          <p>
            The {shortTokenName} community actively participates in the decentralized 
            finance ecosystem. Token holders can engage in trading, liquidity provision, 
            and governance activities. The project aims to build a robust and sustainable 
            cryptocurrency ecosystem with strong community support.
          </p>
        </section>
      </article>
    </div>
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
