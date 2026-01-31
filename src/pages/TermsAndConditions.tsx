import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTranslation } from "react-i18next";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-4 overflow-y-auto pt-safe-top pb-safe-bottom">
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">{t('profile.termsAndConditions')}</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              {t('common.back')}
            </Button>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-4 text-sm">
            <div className="space-y-4">
              <p>
                The ReferdBy Terms and Conditions ("Terms and Conditions") set out below are important and affect your rights as a Customer, Restaurant Manager or Server.
              </p>
              <p>
                Further information is available in our Conditions of Use.
              </p>
              <p>
                <strong>Effective from 27 July 2025</strong>
              </p>
              <p>
                The Terms and Conditions contain some exclusions and limitations of liability.
              </p>

              <h2 className="text-lg font-semibold mt-6 mb-3">1. Membership agreement</h2>
              <p>
                These Terms and Conditions set out the contractual relationship among Referdby and each individual members of the ReferdBy Community.
              </p>
              <p>
                ReferedBy receives, stores and otherwise process and hold members' data in connection with administering aspects of The ReferdBy Club as set out in these Terms and Conditions. In this respect, it is a Data Controller under the Data Protection Act 1998.
              </p>

              <h2 className="text-lg font-semibold mt-6 mb-3">2. Definitions</h2>
              <div className="space-y-3">
                <div>
                  <strong>"Active member"</strong><br />
                  An active member is a member who has earned or redeemed ReferdBy points within the previous 12-month period;
                </div>
                <div>
                  <strong>"ReferdBy Points"</strong><br />
                  means the credits denominated as ReferdBY points collected by a member from ReferdBy and credited to a member's ReferdBY account;
                </div>
                <div>
                  <strong>"Referdby Points schemes" (the "Programmes")</strong><br />
                  ReferdBy points Programme means a loyalty reward programme that uses ReferdBy points as its reward currency;
                </div>
                <div>
                  <strong>"Conditions of Use"</strong><br />
                  means the Conditions of Use relating to certain propositions of The ReferdBy Club as amended from time to time;
                </div>
                <div>
                  <strong>"Data"</strong><br />
                  means data personal to a member;
                </div>
                <div>
                  <strong>"Dispute"</strong><br />
                  means any dispute, claim, or controversy between you and ReferdBY regarding any aspect of your relationship with ReferdBy, whether based in contract, statute, regulation, ordinance, tort (including, but not limited to, fraud, misrepresentation, fraudulent inducement, negligence, gross negligence or reckless behaviour), or any other legal, statutory or equitable theory, and includes the validity, enforceability or scope of these Terms and Conditions, except for the scope, enforceability and interpretation of this Arbitration Agreement and Class Action Waiver.
                </div>
                <p className="ml-4">
                  Dispute SHALL NOT include: (1) claims that all or part of the Class Action Waiver is invalid, unenforceable, unconscionable, void or voidable; and (2) any claim for public injunctive relief, i.e., injunctive relief that has the primary purpose and effect of prohibiting alleged unlawful acts that threaten future injury to the general public. Such claims may be determined only by a court of competent jurisdiction and not by an arbitrator.
                </p>
                <div>
                  <strong>"Eligible spend"</strong><br />
                  means the base bill and restaurant imposed charges on a meal service;
                </div>
                <div>
                  <strong>"Event beyond your control"</strong><br />
                  means unusual and unforeseeable circumstances which you cannot control and the consequences of which you could not have avoided even if you had taken all reasonable care;
                </div>
                <div>
                  <strong>"Fraud"</strong><br />
                  includes fraud, dishonesty and deceit and in particular:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>knowingly supplying incorrect information to accrue ReferdBY points;</li>
                    <li>attempting to accrue Referdby points for restaurant meals which did not take place or are not eligible for ReferdBy points;</li>
                    <li>altering documents to procure ReferdBy points;</li>
                    <li>attempting to accrue Referdby points for meals by any person other than the paying member;</li>
                    <li>attempting to accrue Referdby points more than once for the same meal;</li>
                    <li>selling, bartering and/or purchasing ReferdBY points or redemptions including attempting to sell or transfer ReferdBy points or redemptions by means of internet based sales or auctions; or</li>
                    <li>knowingly benefiting from the fraud or misconduct of another member or individual.</li>
                  </ul>
                </div>
                <div>
                  <strong>"Paying Customer"</strong><br />
                  means the club member paying for a meal for themselves or a party;
                </div>
                <div>
                  <strong>"Loss"</strong><br />
                  means losses, costs, damages, injuries, accidents or claims (whether direct or indirect) suffered by members in connection with the provision of ReferdBy points or redemptions;
                </div>
                <div>
                  <strong>"Member"</strong><br />
                  means the person who is a member of The ReferdBy Club and whose name is shown on an account;
                </div>
                <div>
                  <strong>"Membership"</strong><br />
                  means membership of The ReferdBy Club;
                </div>
                <div>
                  <strong>"Misconduct"</strong><br />
                  includes:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>failure to comply with these Terms and Conditions; or</li>
                    <li>attempting to obtain ReferdBY points by fraud; or</li>
                    <li>misusing the services; or</li>
                    <li>misconduct in a ReferdBy Member Restaurant; or</li>
                    <li>any misconduct including but not limited to the use of false, threatening, abusive or derogatory language or behaving in a threatening, abusive or derogatory manner in dealing with or directed at ReferdBy staff or the staff of any ReferdBy partner restaurant; or</li>
                    <li>any conduct, including but not limited to making misleading statements, which causes, is intended to cause or is likely to cause a detrimental effect or reflects unfavourably on the reputation of ReferdBy or any aspect of its business, brands, products or services; or</li>
                    <li>failure to comply with any other applicable rules and regulations when dining out.</li>
                  </ul>
                </div>
                <div>
                  <strong>"Processing" and "processed"</strong><br />
                  includes obtaining, using, recording and holding in electronic or any other form;
                </div>
                <div>
                  <strong>"Redemptions"</strong><br />
                  means any meal bill, reduced by a member by an appropriate amount of Referdby points;
                </div>
                <div>
                  <strong>"The Referdby Club" (the Club)</strong><br />
                  means The Referdby Club;
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">3. Membership</h2>
              <div className="space-y-3">
                <p><strong>3.1.</strong> Individuals who are 14 years of age or over may apply for membership.</p>
                <p><strong>3.1.1.</strong> ReferdBy reserves the right not to enrol individuals with resident addresses in certain countries and/or regions. Such countries and/or regions are subject to change however reasonable advance notice will be given in circumstances where the removal of a country and/or region will affect the membership of existing members.</p>
                <p><strong>3.2.</strong> Membership is not open to companies, partnerships, unincorporated associations or similar entities.</p>
                <p><strong>3.3.</strong> To apply for membership an individual must br invited by another member. Membership applications must populate their profile and state the applicant's full name. The residence address determines the applicability of any local rules or restrictions relating to the Services and eligibility for local promotions. Members cannot state more than one residence address.</p>
                <p><strong>3.4.</strong> Membership is available at the discretion of Referdby and Referdby may refuse membership to any applicant.</p>
                <p><strong>3.5.</strong> A member may not have multiple memberships. Each member must maintain only one account. If a member violates this rule, all memberships will be cancelled, as will any ReferdBy points contained in the cancelled accounts.</p>
                <p><strong>3.6</strong> Membership will terminate automatically upon the death of a member. Any ReferdBy points accumulated by that member but unused at the time of death shall be cancelled.</p>
                <p><strong>3.7</strong> The Referdby Club is not a members' or proprietors' club.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">4. Protection of members' data</h2>
              <div className="space-y-3">
                <p><strong>4.1.</strong> The data which is processed by ReferdBY in connection with members may include:</p>
                <div className="ml-4 space-y-1">
                  <p><strong>4.1.1.</strong> Membership data (such as ReferdBy points accumulated or redeemed);</p>
                  <p><strong>4.1.2.</strong> Data about meals and restaurants processed by the member including location;</p>
                  <p><strong>4.1.3.</strong> Data supplied by the member;</p>
                  <p><strong>4.1.4.</strong> Data collected when the member is otherwise in contact with ReferdBy.</p>
                </div>
                <p><strong>4.2.</strong> Members consent to their data being transferred to other countries whether or not such countries have data protection laws; and</p>
                <p><strong>4.3.</strong> The purposes for which data may be processed by ReferdBy include:</p>
                <div className="ml-4 space-y-1">
                  <p><strong>4.3.1.</strong> providing services to members;</p>
                  <p><strong>4.3.2.</strong> making changes to services and developing new services;</p>
                  <p><strong>4.3.3.</strong> accounting and audit, safety and security, fraud prevention and investigation, and systems testing, development and maintenance;</p>
                  <p><strong>4.3.4.</strong> the management and administration of The Referdby Club;</p>
                  <p><strong>4.3.5.</strong> communicating to members information about The Referdby Club, including information about Club benefits, using any contact details provided;</p>
                  <p><strong>4.3.6.</strong> conducting market research; and</p>
                  <p><strong>4.3.7.</strong> any other purpose which is obvious or is communicated to the member.</p>
                </div>
                <p><strong>4.4.</strong> Before any data relating to a member is disclosed to a member by ReferdBY, the member may be asked security questions which may require him/her to confirm his/her identity by providing information held by Referdby about that member.</p>
                <p><strong>4.5.</strong> Members are responsible for the security of their online logons and passwords and ReferdBy shall have no liability in the event that a member's logon and/or password is disclosed by the member, whether intentionally or not, so as to allow a third person online access to the data and/or to make any transactions. ReferdBy reserves the right to block online access to the data by or through any third party website not authorised by ReferdBy.</p>
                <p>discontinue relationships with service partners at any time and will give members such notice of any discontinuance as is reasonably practical in the circumstances.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">5. Members eligible for ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>5.1.</strong> Members are not entitled to RefedBy points if the name given when booking does not match exactly the name on their account.</p>
                <p><strong>5.3.</strong> Each member has a responsibility to check that ReferdBy points have been properly credited. This can be checked online at Referdby.com.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">6. Meals eligible for ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>6.1.</strong> ReferdBy Points can only be earned for meals purchased at restaurants that have been referred to by another member, where the restaurant has accepted the referral.</p>
                <p><strong>6.2.</strong> ReferdBy reserves the right to alter the criteria for earning ReferdBy Points</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">7. Collecting ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>7.1.</strong> ReferdBy Points are collected by members from eligible restaurants. The methods to earn those ReferdBy Points are set out in the remainder of this Clause 14.</p>
                <p><strong>7.2.</strong> ReferdBy Points can only be accumulated once per referral at a given restaurant. ReferdBy Points will be credited only to the member who has presented a referral.</p>
                <p><strong>7.3.</strong> ReferdBy will record ReferdBy Points in the member's personal account. ReferdBy Points points cannot be spent until ReferdBy has recorded them in the member's personal account.</p>
                <p><strong>7.4.</strong> ReferdBy Points which are not tracked automatically at the time of a referral may be credited later at ReferdBy' discretion with co-operation from the associated restaurant. Members may not claim ReferdBy Points after a meal if they have not presented a referral.</p>
                <p><strong>7.5.</strong> In cases of dispute about entitlement to ReferdBy Points, ReferdBy may require proof of payment at the relevant restaurant where it claimed a referral was presented. Claims must be lodged within 1 month of the date in question. 14.13.2. ReferdBy Points earned on eligible spend are tracked by us and based on flown tickets, pro-rated per flight sector, and rounded to the nearest whole number. ReferdBy Points for eligible ancillaries will be awarded once the ancillary has been used against the associated flight sector it was purchased for.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">8. Spending ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>8.1.</strong> ReferdBy Points are redeemed by members with ReferdBy through affiliate restaurants. The methods to redeem those ReferdBy Points and access to the rewards are set out in the remainder of this Clause 15 and the Conditions of Use.</p>
                <p><strong>8.2.</strong> Requests to redeem are made online app.referdby.com. Redemptions can only be requested by the member who holds the account.15.7. E-tickets in respect of reward travel will be issued for travel on all routes where possible.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">9. General</h2>
              <div className="space-y-3">
                <p><strong>9.1.</strong> From time to time, ReferdBy may offer special promotional rates for ReferdBy Points and such accruals will be subject to the Terms and Conditions as published with each offer and, in the event of a conflict, take precedence over these Terms and Conditions. Unless otherwise permitted by ReferdBy, rewards (including those special promotional rewards) may not be used in conjunction with other awards, promotions, coupons, discounts or special offers.</p>
                <p><strong>9.2.</strong> ReferdBy reserve the right to audit a Restaurant's account and records without notice to check for compliance with the Terms and Conditions and any other applicable rules, regulations or Terms and Conditions..</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">10. Ownership of ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>10.1.</strong> ReferdBy Points, and all rights of title to and property in such ReferdBy Points issued at any time, remain with Referdby at all times and never pass to the member.</p>
                <p><strong>10.2.</strong> Risk (for example, theft or unauthorised or fraudulent redemption) associated with ReferdBy Points passes to the member as soon as ReferdBy Points are recorded on the member's account, or otherwise awarded to the member. ReferdBy is not liable for unauthorised or fraudulent redemptions arising due to the actions of the member or the failure by the member to adhere to these Terms and Conditions.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">11. Non transferability of ReferdBy Points</h2>
              <div className="space-y-3">
                <p><strong>11.1.</strong> Except as otherwise provided by ReferdBy and communicated to the member, ReferdBy Points are not transferable (whether from person to person, account to account, or otherwise) other than in accordance with the Conditions of Use and cannot be bequeathed, devised or otherwise transferred by operation of law.</p>
                <p><strong>11.2.</strong> Any purported purchase, sale, transfer, unauthorised use (including bartering), procurement or redemption of ReferdBy Points issued to another person or any other use of ReferdBy Points contrary to these Terms and Conditions will constitute a fundamental breach by the member of these Terms and Conditions and the Conditions of Use.</p>
                <p><strong>11.3.</strong> Each member acknowledges that a breach pursuant to Clause 11.2 above may also constitute an inducement to breach the contract among ReferdBy and the member, intentional damage to the business of ReferdBy, or conspiracy and criminal offences under the applicable local or national law. Any breach pursuant to Clause 11.2 will constitute fraud and/or misconduct and will be dealt with in accordance with Clause 24.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">12. Member's right to terminate membership</h2>
              <p>Members may terminate their membership using app.referdby.com. Any such termination will result in a loss of all ReferdBy Points and does not relieve the member of any continuing obligations under these Terms and Conditions.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">13. ReferdBy' right to terminate membership</h2>
              <div className="space-y-3">
                <p><strong>13.1.</strong> In addition to any other rights or remedies it may have, ReferdBy reserves the right at any time in its absolute discretion to terminate the membership of any member and/or the right of any member to use their membership if a member commits fraud, misconduct, is given a banning notice or withdraws their consent under Clause 4. If this occurs, ReferdBy must write to the member to inform them that his/her membership is being terminated for this reason. ReferdBy and/or AGL may in its discretion suspend such termination and impose a reduction in tier and/or remove ReferdBy Points and/or tier points and/or request undertakings in respect of future conduct.</p>
                <p><strong>13.2.</strong> In the case of fraud and/or misconduct, ReferdBy may cancel all accrued ReferdBy Points of the membe.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">14. Termination of The ReferdBy Club</h2>
              <p>ReferdBy may terminate The ReferdBy Club at any time. Except in the event of insolvency of ReferdBy. In the event of insolvency of ReferdBy, each member acknowledges and agrees that their right to use the services (including the collecting and spending of ReferdBy Points will cease with immediate effect.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">15. Modification or withdrawal of The ReferdBy Club services</h2>
              <div className="space-y-3">
                <p><strong>15.1.</strong> ReferdBy may in its sole discretion modify, withdraw, amend or add to any services or other offers or arrangements or impose any requirements or restrictions relating to the use of services. ReferdBy will give as much advance notice as practicable of such action to members. Current information is set out on ReferdBy.com.</p>
                <p><strong>15.2.</strong> Examples of the action which ReferdBy might take under Clause 15.1. include withdrawing, modifying the right to collect or redeem ReferdBy Points, including amending the rates of redemptions. In addition, Restaurants listed on ReferedBy reserve the rights to withdraw, amend or add to options or requirements or restrictions relating to them.</p>
                <p><strong>15.3.</strong> Members shall be deemed to have agreed to any modifications, withdrawal, amendment or addition to the services or The ReferdBy Club ReferdBy Points programme pursuant to Clause 15.1 if, after they have been notified of the changes, they continue to use the app.referedby.com capabilities to obtain services. Members who do not wish to accept changes in the services may terminate their membership.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">16. Variation of currency</h2>
              <p>ReferdBy changes the currency used by The ReferdBy Club either in whole or in relation to any country or region.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">17. Variation of these Terms and Conditions</h2>
              <p>ReferdBy reserve the right at all times to make any changes to the Terms and Conditions subject to giving members reasonable notice as appropriate in the circumstances. Members who do not accept the amendments may terminate their membership.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">18. Exclusion of liability</h2>
              <div className="space-y-3">
                <p><strong>18.1.</strong> ReferdBy will not be liable for any loss resulting from alteration to, or termination of the programme or the right to collect or redeem ReferdBy Points, except for loss caused by its own negligence or wilful misconduct.</p>
                <p><strong>18.2.</strong> ReferdBy will not be liable for any loss if, by reason of local legal or regulatory prohibitions or restrictions, The ReferdBy Club or the whole or any part of the services cannot be made available in certain countries or to certain members.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">19. Member's tax liabilities</h2>
              <div className="space-y-3">
                <p><strong>19.1.</strong> ReferdBy does not make any representations as to any income, use, excise or other tax liability of members as a result of their ReferdBy Club membership. Such a tax liability may arise, for example, if a member obtains ReferdBy Points and redemptions as a result of business expenditure. Members are advised to check with their accountant or tax adviser for further information.</p>
                <p><strong>19.2.</strong> The member is solely responsible for any tax liability incurred as a result of membership.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">20. Customer service</h2>
              <p>ReferdBy are constantly trying to improve the services ReferdBy provides to its members. Any member with concerns or complaints should contact ReferdBy via www.Referdby.com.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">21. Governing Law</h2>
              <div className="space-y-3">
                <p><strong>21.1.</strong> To the extent permissible by local law or regulation these Terms and Conditions shall be governed by and construed in accordance with English law, except if you are a resident of the USA or Canada. If you are a resident of the USA or Canada, these Terms and Conditions (and any agreements incorporated therein) and your relationship with ReferdBy or The ReferdBy Club is governed in all aspects by the substantive laws of the State of New York (USA), without regard to its choice of law rules. Any member who do not reside in the USA or Canada submit to the non-exclusive jurisdiction of the English courts to resolve any disputes that may arise out of them.</p>
                <p><strong>22.2.</strong> Any provision of these Terms and Conditions declared void or unenforceable by any competent authority or court shall, to the extent of such invalidity or unenforceability, be deemed severable and shall not affect the other provisions remaining which shall continue unaffected.</p>
                <p><strong>22.3.</strong> If there is any conflict in meaning between the English language version of these Terms and Conditions and any version or translation of these Terms and Conditions in any other language, the English language version shall prevail.</p>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3">23. Class Action Waiver for Residents of the United States and Canada</h2>
              <p><strong>23.1</strong> If you are a resident of the USA or Canada, to the extent permissible by local law or regulation, you agree that the resolution of any Dispute shall be conducted on an individual, not a class-wide basis ("Class Action Waiver"), and that no such proceeding may be consolidated with any other legal proceedings involving ReferdBy or any other person. You further agree that you, and anyone asserting a claim for you, will not be a class representative, class member, or otherwise participate in a class, representative, consolidated or private attorney general proceeding against ReferdBy.</p>

              <h2 className="text-lg font-semibold mt-6 mb-3">24. Dispute Resolution and Arbitration Agreement for Residents of the United States and Canada</h2>
              <div className="space-y-4">
                <h3 className="text-base font-semibold">24.1 United States Residents</h3>
                <div className="space-y-3">
                  <p><strong>24.1.1</strong> The resolution of any Dispute by a resident of the United States is agreed by you and ReferdBy to be subject to the following conditions:</p>
                  <p><strong>24.1.2</strong> All Disputes arising from or relating to these Terms and Conditions shall be resolved in binding arbitration ("U.S. Arbitration Agreement") in accordance with the Federal Arbitration Act, 9 U.S.C. § 1 et seq., which shall govern the interpretation and enforcement of this U.S. Arbitration Agreement.</p>
                  <p>You and ReferdBy agree that any and all disputes, whether presently in existence or based on acts or omissions in the past or in the future, will be resolved exclusively and finally by binding arbitration rather than in court by a judge or jury.</p>
                  <p><strong>24.1.3</strong> Limitations Period: The party seeking relief shall serve a demand for arbitration on the other party within a reasonable time after the Dispute has arisen, and in no event shall demand be made after two years from when the aggrieved party knew or should have known of the Dispute.</p>
                  <p><strong>24.1.4</strong> ReferdBy and you agree that the arbitrator of any Dispute may not consolidate more than one person's claims, and may not otherwise preside over any form of a class or representative proceeding or claims (such as a class action, representative action, consolidated action or private attorney general action).</p>
                  <p><strong>24.1.5</strong> If the Class Action Waiver or any portion thereof is found to be illegal or unenforceable, then the U.S. Arbitration Agreement set forth herein will be unenforceable, and the Dispute will be decided by a court.</p>
                  <p><strong>24.1.6</strong> The arbitration proceedings shall be before a neutral arbitrator in a location within the continental United States that is convenient to you. If you and ReferdBy are not able to agree upon the selection of an arbitrator within thirty days after the commencement of an arbitration proceeding by service of a demand for arbitration, the arbitrator shall be selected by the American Arbitration Association ("AAA"). The arbitration shall be administered pursuant to the AAA's Commercial Arbitration Rules and Mediation Procedures and Supplementary Procedures for Consumer-Related Disputes. If required for the enforceability of this U.S. Arbitration Agreement under the Federal Arbitration Act, ReferdBy will pay all arbitrator's costs and expenses. If not, those costs will be paid as specified in the above-referenced rules.</p>
                </div>

                <h3 className="text-base font-semibold">24.2 Canadian Residents</h3>
                <div className="space-y-3">
                  <p><strong>24.2.1</strong> Canadian residents consent to have any Dispute arising from these Terms and Conditions resolved pursuant to the following procedure:</p>
                  <p><strong>24.2.2</strong> Notice and Negotiation. You will give ReferdBy notice of any Dispute arising from these Terms and Conditions. Following such notification the parties shall meet at a mutually acceptable time and place within 30 days after delivery of such notice and thereafter as often as they reasonably deem necessary to exchange relevant information and to attempt to resolve the Dispute. If the parties have not resolved the Dispute within 90 days of the disputing party's notice, the parties may initiate mediation as set out below.</p>
                  <p><strong>24.2.3</strong> Mediation. If the Dispute has not been resolved by negotiation as provided above within 90 days of notice being given, any such Dispute will be referred to and determined by private confidential mediation before a single mediator chosen by the parties and at their joint cost. For avoidance of doubt, you expressly understand and agree that you may only mediate matters in your individual capacity and cannot mediate the claims of any other person or on behalf of a class of persons.</p>
                  <p><strong>24.2.4</strong> Arbitration. Should the parties after mediation in good faith fail to reach a settlement of any dispute the issue(s) between them shall be determined by private, confidential and binding arbitration by the same person originally chosen as the mediator. For avoidance of doubt, you expressly understand and agree that you may only arbitrate matters in your individual capacity and cannot arbitrate the claims of any other person or on behalf of a class of persons.</p>
                  <p><strong>24.2.5</strong> Legal Proceedings. In the event that the applicable jurisdiction prohibits binding arbitration in respect of the claimant or the circumstances related to the claim, and the parties after mediation in good faith fail to reach a settlement of any Dispute, either party may refer any remaining Dispute to adjudication through a court of competent jurisdiction.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border text-center space-y-2">
                <p>© Copyright 2025 ReferdBy, all rights reserved.</p>
                <p>© ReferdBy - all rights reserved</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Footer */}
          <div className="border-t pt-6 mt-8">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="default" 
                onClick={() => navigate("/")}
                className="flex-1 sm:flex-initial"
              >
                {t('common.home')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-initial"
              >
                {t('common.back')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/profile")}
                className="flex-1 sm:flex-initial"
              >
                {t('common.profile')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TermsAndConditions;