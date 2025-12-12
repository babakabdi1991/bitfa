import { getTokenDescription, searchToken, getToken } from "@/services/http/token.http";
import { Metadata } from "next";
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
import TokenPageClient from "@/components/features/token/TokenPageClient";
import { IToken } from "@/types/token.type";
import dayjs from "dayjs";

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

// Server Component - renders full SEO content
export default async function Token({ params }: Props) {
  // Fetch all data server-side
  const searchedToken = await searchToken({
    params: {
      currencyAddress: params.params[1],
    },
  });

  const tokenDescription = await getTokenDescription(params.params[1]);
  
  const tokenData = await getToken(params.params[1], { 
    params: { network: params.params[0] } 
  });

  const token = searchedToken?.data?.[0];
  const tokenName = token?.attributes?.name || "Unknown Token";
  const shortTokenName = tokenName.trim().split("/")[0];
  
  // Format data for SEO content
  const priceValue = token?.attributes?.base_token_price_usd;
  const price = priceValue ? Number(priceValue).toFixed(10) : "N/A";
  
  const liquidityValue = token?.attributes?.reserve_in_usd;
  const liquidity = liquidityValue ? Number(liquidityValue).toFixed(2) : "N/A";
  
  const createdAt = token?.attributes?.pool_created_at
    ? dayjs(token.attributes.pool_created_at).format("YYYY-MM-DD")
    : "N/A";
  
  const priceChangeValue = token?.attributes?.price_change_percentage?.h24;
  const priceChange = priceChangeValue
    ? Number(priceChangeValue).toFixed(2) + "%"
    : "N/A";
  
  const baseTokenId = token?.relationships?.base_token?.data?.id || "N/A";
  const [bnetwork, baseTokenAddress] = baseTokenId !== "N/A" ? baseTokenId.split("_") : ["N/A", "N/A"];
  
  const listedExchange = token?.relationships?.dex?.data?.id || "N/A";
  const blockchain = token?.id?.split("_")[0] || "unknown blockchain";

  const volumeH24 = token?.attributes?.volume_usd?.h24 
    ? Number(token.attributes.volume_usd.h24).toFixed(2) 
    : "N/A";

  const fdv = token?.attributes?.fdv_usd
    ? Number(token.attributes.fdv_usd).toFixed(2)
    : "N/A";

  const marketCap = token?.attributes?.market_cap_usd
    ? Number(token.attributes.market_cap_usd).toFixed(2)
    : "N/A";

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
        ${searchedToken.data?.[0].attributes?.name?.split("/")[0].toUpperCase()}{" "}
        DEX – Live {params.params[TOKEN_PAGE_PARAMS.NETWORK].toUpperCase()}{" "}
        Market Data
      </h1>

      {/* SERVER-SIDE RENDERED SEO CONTENT - Visible to crawlers */}
      <article className="seo-content prose prose-slate max-w-none my-8">
        <h2 className="text-2xl font-bold mb-4">{shortTokenName} Token Overview and Market Analysis</h2>
        
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Current Token Metrics</h3>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium inline">Current Price:</dt>
                <dd className="inline ml-2">${price} USD</dd>
              </div>
              <div>
                <dt className="font-medium inline">24-Hour Price Change:</dt>
                <dd className="inline ml-2">{priceChange}</dd>
              </div>
              <div>
                <dt className="font-medium inline">Liquidity Pool:</dt>
                <dd className="inline ml-2">${liquidity} USD</dd>
              </div>
              <div>
                <dt className="font-medium inline">24-Hour Volume:</dt>
                <dd className="inline ml-2">${volumeH24} USD</dd>
              </div>
              <div>
                <dt className="font-medium inline">Market Cap:</dt>
                <dd className="inline ml-2">${marketCap} USD</dd>
              </div>
              <div>
                <dt className="font-medium inline">Fully Diluted Valuation:</dt>
                <dd className="inline ml-2">${fdv} USD</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Token Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium inline">Blockchain Network:</dt>
                <dd className="inline ml-2">{blockchain}</dd>
              </div>
              <div>
                <dt className="font-medium inline">Trading Platform:</dt>
                <dd className="inline ml-2">{listedExchange}</dd>
              </div>
              <div>
                <dt className="font-medium inline">Contract Address:</dt>
                <dd className="inline ml-2 break-all">{params.params[1]}</dd>
              </div>
              <div>
                <dt className="font-medium inline">Pool Created:</dt>
                <dd className="inline ml-2">{createdAt}</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">About {shortTokenName}</h3>
          <p className="mb-4">
            {shortTokenName} is a cryptocurrency token that operates on the {blockchain} blockchain network. 
            The token is currently trading at ${price} USD with a 24-hour price change of {priceChange}. 
            It is available for trading on {listedExchange}, a decentralized exchange platform that provides 
            secure and transparent trading services for cryptocurrency enthusiasts and investors.
          </p>
          <p className="mb-4">
            The token was launched on {createdAt} and has since established a liquidity pool of ${liquidity} USD, 
            which ensures stable trading conditions and minimal slippage for traders. The 24-hour trading volume 
            stands at ${volumeH24} USD, indicating active market participation and healthy trading activity.
          </p>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">How to Trade {shortTokenName}</h3>
          <p className="mb-4">
            Trading {shortTokenName} on the {blockchain} network is straightforward and secure. The token 
            is available on {listedExchange}, where users can buy, sell, and exchange {shortTokenName} 
            using various trading pairs. The platform provides real-time price charts, order books, and 
            trading history to help traders make informed decisions.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Trading Features Available:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Real-time price charts with technical indicators and drawing tools</li>
            <li>Live order book showing current buy and sell orders</li>
            <li>24-hour trading volume and price change tracking</li>
            <li>Liquidity pool depth analysis for optimal trading</li>
            <li>Token holder statistics and distribution charts</li>
            <li>Smart contract security verification and audit reports</li>
            <li>Historical price data and performance metrics</li>
            <li>Market depth visualization for better trade execution</li>
            <li>Transaction history with detailed trade information</li>
            <li>Price alerts and notification systems for traders</li>
          </ul>

          <p className="mb-4">
            The {blockchain} network offers fast transaction speeds and low fees, making it an ideal 
            platform for trading {shortTokenName}. Traders can connect their wallets to {listedExchange} 
            and start trading immediately without the need for account registration or KYC verification.
          </p>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">{shortTokenName} Market Analysis</h3>
          <p className="mb-4">
            The current market performance of {shortTokenName} shows a 24-hour price change of {priceChange}, 
            indicating {parseFloat(priceChange) > 0 ? 'positive' : 'negative'} market sentiment. With a 
            liquidity pool of ${liquidity} USD, the token maintains good price stability and low slippage 
            for traders of all sizes.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Key Market Indicators:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Price volatility analysis based on recent trading patterns</li>
            <li>Volume-to-liquidity ratio indicating market efficiency</li>
            <li>Trading volume trends over different time periods</li>
            <li>Liquidity depth and market maker presence</li>
            <li>Holder concentration and distribution metrics</li>
            <li>Smart contract interaction frequency</li>
            <li>Cross-exchange price comparison and arbitrage opportunities</li>
            <li>On-chain transaction volume and wallet activity</li>
            <li>Market cap ranking within the {blockchain} ecosystem</li>
            <li>Price correlation with major cryptocurrency markets</li>
          </ul>

          <p className="mb-4">
            The token's market capitalization of ${marketCap} USD and fully diluted valuation of ${fdv} USD 
            provide insights into its current valuation and potential growth. The 24-hour trading volume of 
            ${volumeH24} USD demonstrates active market participation and sufficient liquidity for traders.
          </p>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Security and Safety</h3>
          <p className="mb-4">
            {shortTokenName} operates on the {blockchain} blockchain, which provides robust security features 
            and transparent transaction verification. All smart contract interactions are recorded on-chain 
            and can be verified through blockchain explorers, ensuring complete transparency for all users.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Security Features:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Smart contract code verification and auditing</li>
            <li>On-chain transaction transparency and traceability</li>
            <li>Decentralized architecture without single points of failure</li>
            <li>Community-driven security monitoring and reporting</li>
            <li>Regular security assessments and vulnerability checks</li>
            <li>Multi-signature wallet support for enhanced security</li>
            <li>Automated security scoring and risk assessment</li>
            <li>Real-time monitoring of suspicious wallet activities</li>
            <li>Contract ownership analysis and verification</li>
            <li>Liquidity lock verification and time-lock mechanisms</li>
          </ul>

          <p className="mb-4">
            The platform provides comprehensive security information including contract verification status, 
            ownership details, and potential security risks. Traders are encouraged to review all security 
            metrics before engaging in trading activities.
          </p>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Token Holder Analysis</h3>
          <p className="mb-4">
            Understanding the distribution of {shortTokenName} among holders provides valuable insights into 
            the token's decentralization and potential price stability. A well-distributed token with many 
            holders typically indicates a healthy community and reduced risk of price manipulation.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Holder Metrics:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Total number of token holders and wallet addresses</li>
            <li>Top holder concentration and whale activity monitoring</li>
            <li>Holder growth rate and new wallet acquisition</li>
            <li>Average holding period and token retention metrics</li>
            <li>Distribution across different wallet size categories</li>
            <li>Smart contract vs. individual holder breakdown</li>
            <li>Historical holder count changes and trends</li>
            <li>Wallet activity patterns and trading behaviors</li>
            <li>Dormant wallet analysis and token circulation</li>
            <li>Cross-chain holder distribution if applicable</li>
          </ul>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Trading Strategies for {shortTokenName}</h3>
          <p className="mb-4">
            Successful trading of {shortTokenName} requires understanding market dynamics, technical analysis, 
            and risk management principles. The token's liquidity of ${liquidity} USD ensures that traders 
            can execute their strategies effectively without significant slippage.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Popular Trading Approaches:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Day trading using short-term price movements and technical indicators</li>
            <li>Swing trading based on medium-term price trends and patterns</li>
            <li>Position trading for long-term value appreciation</li>
            <li>Liquidity provision for passive income generation</li>
            <li>Arbitrage opportunities across different exchanges</li>
            <li>Dollar-cost averaging for systematic accumulation</li>
            <li>Momentum trading following strong price movements</li>
            <li>Range trading within established support and resistance levels</li>
            <li>Breakout trading when price breaks key technical levels</li>
            <li>News-based trading responding to market developments</li>
          </ul>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">{blockchain} Network Advantages</h3>
          <p className="mb-4">
            The {blockchain} blockchain provides several advantages for {shortTokenName} traders and holders. 
            The network's architecture ensures fast transaction processing, low fees, and high scalability, 
            making it ideal for active trading and frequent transactions.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Network Benefits:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Fast transaction confirmation times for quick trade execution</li>
            <li>Low transaction fees making frequent trading economical</li>
            <li>High throughput capacity handling many transactions simultaneously</li>
            <li>Robust security model protecting user assets and data</li>
            <li>Active developer community and ecosystem growth</li>
            <li>Wide range of compatible wallets and trading tools</li>
            <li>Interoperability with other blockchain networks</li>
            <li>Regular network upgrades and improvements</li>
            <li>Established infrastructure and service providers</li>
            <li>Strong community support and documentation</li>
          </ul>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Community and Ecosystem</h3>
          <p className="mb-4">
            The {shortTokenName} community plays a crucial role in the token's development and adoption. 
            Active community participation through social media, forums, and governance platforms helps 
            shape the token's future direction and ensures transparency in decision-making processes.
          </p>
          
          <p className="mb-4">
            Community members can engage in various activities including trading discussions, technical 
            analysis sharing, project development proposals, and educational content creation. The growing 
            ecosystem around {shortTokenName} includes developers, traders, investors, and enthusiasts who 
            contribute to the token's success and adoption.
          </p>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Risk Considerations</h3>
          <p className="mb-4">
            Like all cryptocurrency investments, trading {shortTokenName} carries inherent risks that traders 
            should understand before participating. Market volatility, regulatory changes, technical issues, 
            and other factors can affect token prices and trading conditions.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Important Risk Factors:</h4>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Market volatility and potential for significant price fluctuations</li>
            <li>Liquidity risks during periods of high market stress</li>
            <li>Smart contract vulnerabilities and potential exploits</li>
            <li>Regulatory uncertainty and potential legal changes</li>
            <li>Concentration risks from large token holders</li>
            <li>Technical risks including network congestion and failures</li>
            <li>Competition from similar tokens and projects</li>
            <li>Market manipulation risks in low liquidity conditions</li>
            <li>Wallet security and private key management risks</li>
            <li>Exchange risks including hacks and service interruptions</li>
          </ul>
          
          <p className="mb-4">
            Traders should conduct thorough research, understand their risk tolerance, and only invest 
            amounts they can afford to lose. Diversification, proper position sizing, and risk management 
            techniques are essential for long-term trading success.
          </p>
        </section>

        {tokenDescription?.data?.data?.content && (
          <section className="my-6">
            <h3 className="text-xl font-semibold mb-3">Detailed Token Information</h3>
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: tokenDescription.data.data.content 
              }} 
            />
          </section>
        )}

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with {shortTokenName}</h3>
          <p className="mb-4">
            New traders interested in {shortTokenName} should begin by setting up a compatible wallet for 
            the {blockchain} network. Popular options include MetaMask, Trust Wallet, and other web3-enabled 
            wallets that support the network. Once a wallet is set up and funded, users can connect to 
            {listedExchange} and start trading.
          </p>
          
          <h4 className="text-lg font-semibold mb-2">Steps to Start Trading:</h4>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>Set up a compatible {blockchain} wallet and secure your private keys</li>
            <li>Acquire {blockchain} native tokens for transaction fees</li>
            <li>Connect your wallet to {listedExchange} platform</li>
            <li>Review {shortTokenName} market data and security information</li>
            <li>Start with small trades to familiarize yourself with the platform</li>
            <li>Monitor your positions and set appropriate stop-loss orders</li>
            <li>Stay informed about market news and token developments</li>
            <li>Engage with the community to learn from experienced traders</li>
            <li>Practice proper risk management and portfolio diversification</li>
            <li>Keep detailed records of all trades for tax purposes</li>
          </ol>
        </section>

        <section className="my-6">
          <h3 className="text-xl font-semibold mb-3">Conclusion</h3>
          <p className="mb-4">
            {shortTokenName} represents an active trading opportunity on the {blockchain} blockchain with 
            current pricing at ${price} USD and a 24-hour change of {priceChange}. The token's liquidity 
            of ${liquidity} USD and trading volume of ${volumeH24} USD indicate healthy market conditions 
            for traders of all sizes.
          </p>
          <p>
            Whether you're a day trader, swing trader, or long-term investor, {shortTokenName} offers 
            various opportunities within the decentralized finance ecosystem. Always conduct thorough 
            research, understand the risks, and trade responsibly on {listedExchange} and other supported 
            platforms.
          </p>
        </section>
      </article>

      {/* CLIENT-SIDE INTERACTIVE COMPONENTS - Hidden from initial SEO crawl but loads for users */}
      <TokenPageClient params={params} token={searchedToken} />

      {tokenDescription &&
        tokenDescription.data &&
        tokenDescription.data.data && (
          <>
            <TokenAccordion
              tokenImageUrl={
                searchedToken.data?.[0].seoImageUrl ??
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