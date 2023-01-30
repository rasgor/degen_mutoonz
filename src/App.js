import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { Socialmedia } from "./components/Socialmedia";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 10px;
  border: none;
  background-color: var(--secondary);
  padding: 20px 10px;
  font-weight: bold;
  font-size: clamp(14px, 4vw, 22px);
  color: #FFF;
  letter-spacing: 0.8px;
  min-width: 150px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(0, 0, 0, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 10px;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 2rem;
  color: var(--primary-text);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(0, 0, 0, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px solid var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const isDev = () =>   !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  const Parallax = (e) => {
    const elem = document.querySelector("#parallax");

    let _w = window.innerWidth/2;
    let _h = window.innerHeight/2;
    let _mouseX = e.clientX;
    let _mouseY = e.clientY;
    let _depth1 = `${50 - (_mouseX - _w) * 0.005}% ${50 - (_mouseY - _h) * 0.005}%`;
    let _depth2 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.075}%`;
    let _depth3 = `${50 - (_mouseX - _w) * 0.015}% ${50 - (_mouseY - _h) * 0.01}%`;
    let _depth4 = `${50 - (_mouseX - _w) * 0.03}% ${50 - (_mouseY - _h) * 0.015}%`;
    let _depth5 = `${50 - (_mouseX - _w) * 0.04}% ${50 - (_mouseY - _h) * 0.02}%`;
    let x = `${_depth5},${_depth4},${_depth3}, ${_depth2}, ${_depth1}`;
    elem.style.backgroundPosition = x;
  }

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("°º¤ø Sorry, something went wrong please try again later. ø¤°º¤");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `CONGRATS, to the proud owner of a ${CONFIG.NFT_NAME}. The NFT is yours! Go visit nova.stratosnft.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {

      window.contract = blockchain.smartContract;

      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  useEffect(() => {
    const sections = [...document.querySelectorAll("section")];
    
let options = {
  rootMargin: "0px",
  threshold: 0.75,
};

const callback = (entries, observer) => {
  entries.forEach((entry) => {
    const { target } = entry;

    if (entry.intersectionRatio >= 0.75) {
      target.classList.add("is-visible");
    } else {
      target.classList.remove("is-visible");
    }
  });
};

const observer = new IntersectionObserver(callback, options);

sections.forEach((section, index) => {
  const sectionChildren = [...section.querySelector("[data-content]").children];
  if (sectionChildren) {

  sectionChildren.forEach((el, index) => {
    el.style.setProperty("--delay", `${index * 250}ms`);
  });

  observer.observe(section);
}
});
  }, []);

  return (
    <s.Screen>
      <section className="section" style={{ display: isDev()?'':'none' }}>
      <div
         className="section__content"
         data-content
         ></div>
      <s.Background
        id="parallax"
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg1.png" : null} 
        onMouseMove={(e) => {
          //Parallax(e);
        }}
      >
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"DEGEN MUTOONZ"} src={"/config/images/example.gif"} style={{ display: "none"}} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            id="glass"
            style={{
              padding: 5,
              borderRadius: 18,
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: "8vw",
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)", lineHeight: "1" }}
                >
                  1 MUTOONZ costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)", fontSize: "1rem" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerMedium />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"} style={{
                  }}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                        fontSize: "1rem"
                      }}
                    >
                      Please connect to the {CONFIG.NETWORK.NAME} network<br></br><br></br>
                      </s.TextDescription>
                      <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                        fontSize: "0.8rem",
                        fontWeight: "normal",
                        lineHeight: "1.25"
                      }}
                    >
                    </s.TextDescription>
                    <p><u>Useful links for preparation</u></p>
                      <ul>
                        <li><a href="https://chainlist.org/chain/42170" target="_blank">Add</a> Arbitrum Nova Chain to your Metamask</li>
                        <li><a href="https://bridge.arbitrum.io/" target="_blank">Bridge</a> some ETH to Arbitrum Nova Chain</li>
                      </ul>
                    <s.SpacerLarge />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                          fontSize: "2.2rem"
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerLarge />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"DEGEN MUTOONZ"}
              src={"/config/images/example.gif"}
              style={{ display: "none"}}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: "1rem"
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: "1rem"
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Background>
      </section>
      <section className="section">
        <Socialmedia></Socialmedia>
        <ul id="menu">
          <li><a href="#whatsnext" className="bubble bubble--highlight">What's next</a></li>
        </ul>
      <div id="slogan">
        <img src="config/images/mutoonz-title.png" />
      </div>
      <div
         className="section__content"
         data-content
         >
      <div className="presentation">
      <div id="bandit">
        <div className="inner">
        <div className="bandit"></div>
        <div className="eyes"></div>
        <div className="money"></div>
      </div>
      </div>
      <div id="intro">
        <div className="box box2">
          <div className="evenboxinner">
            <h1>888 DEGEN MUTOONZ ready to conquer the world.</h1>
            <p>Beware of the danger ahead of us. Equip yourself with a mutoon to be prepared for the things 
              to come on our future journey through tough times. So don't lose any time and grab your DEGEN MUTOONZ.</p>
          </div>
        </div>
        </div>
        </div>
        </div>
      <div className="pie">
    <p className="p1"></p>
    <p className="p2"></p>
    <p className="p3"></p>
    <p className="p4"></p>
    <p className="p5"></p>
    <p className="p6"></p>
    <p className="p7"></p>
    <p className="p8"></p>
    <p className="p9"></p>
    <p className="p10"></p>
    <p className="p11"></p>
    <p className="p12"></p>
    <p className="p13"></p>
    <p className="p14"></p>
    <p className="p15"></p>
    <p className="p16"></p>
    <p className="p17"></p>
    <p className="p18"></p>
    <p className="p19"></p>
    <p className="p20"></p>
    <p className="p21"></p>
    <p className="p22"></p>
    <p className="p23"></p>
    <p className="p24"></p>
    <p className="p25"></p>
    <p className="p26"></p>
    <p className="p27"></p>
    <p className="p28"></p>
    <p className="p29"></p>
    <p className="p30"></p>
  </div>
      </section>
      <section className="section whatsnext" id="whatsnext">
      <div
         className="section__content"
         data-content
         >
          <div>
          <div className="box box2">
            <div className="evenboxinner">
              <p>
        Prevent your DEGEN Mutoonz from catching a cold and a worse cough! Get your DNA injection now!</p>

              <p><a href="#" className="bubble">INJECTION COMMING SOON !</a></p>
        </div>
        </div>
        </div>
            <div className="injections">
              <div className="normal">
              <div className="box box2">
          <div className="evenboxinner">
          <h3><a href="https://opensea.io/assets/arbitrum-nova/0xdae44eab390c3aa63ee5868c4166a09e35515058/1" title="Get your injection on Opensea">DNA Injection</a></h3>
          </div>
          </div>
              </div>
              <div className="deluxe">
              <div className="box box2">
          <div className="evenboxinner">
          <h3><a href="https://opensea.io/assets/arbitrum-nova/0xdae44eab390c3aa63ee5868c4166a09e35515058/2" title="Get your injection on Opensea">DNA Injection - Deluxe</a></h3>
          </div>
          </div>
              </div>
              <div className="golden">
              <div className="box box2">
          <div className="evenboxinner">
          <h3><a href="https://opensea.io/assets/arbitrum-nova/0xdae44eab390c3aa63ee5868c4166a09e35515058/3" title="Get your injection on Opensea">DNA Injection - Golden shot</a></h3>
          </div>
          </div>
              </div>
            </div>
          </div>
      </section>
      <section className="section team">
      <div
         className="section__content"
         data-content
         >
          <div>
            <div className="box box2">
          <div className="evenboxinner">
          <h1>Team</h1>
          </div>
          </div>
          </div>
          <div>
          <div className="profile box box2">
          <div className="evenboxinner">
          <h3>RASGOR</h3>
          <span>Tech</span>
          <div className="rasgor"></div>
          </div>
          </div>
          <div className="profile box box2">
          <div className="evenboxinner">
          <h3>
            Fantomas
          </h3>
          <span>Design</span>
          <div className="fantomas"></div>
          </div>
          </div>
          </div>
         </div>
         <div className="copyright">© DEGEN MUTOONZ Corp 2022</div>
      </section>
    </s.Screen>
  );
}

export default App;
