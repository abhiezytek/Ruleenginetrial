1. Gender (Rule Name: STP001):

If ‘LA Gender’ = Male or Female; then STP Pass else STP Fail
Letter flag status ‘O’ (follow up code: TGQ (Transgender))

2. Annual income (Rule Name: STP003[PC1]):

If ‘LA occupation’ <> student or housewife and ‘LA annual Income’ = 0; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Annual income 0 for earning life)

3. Avocation (Rule Name: STP004[PC2]):

If ‘Is Adventurous’ is true; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Avocation engagement)

4. Build (Rule Name: STP005[PC3]):

a. Rule Name: STP005A

If ‘Life Product’ and BMI > 30 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MPN’ (Physical MER))

b. Rule Name: STP005B

If ‘Health Product’ and BMI > 29 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MPN’ (Physical MER))

c. Rule Name: STP005C

If ‘Life Product’ and BMI < 18 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MPN’ (Physical MER))

d. Rule Name: STP005D

If ‘Life Product’ and BMI < 18 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MCE’ (CBC & ESR))

e. Rule Name: STP005E

If ‘Health Product’ and BMI < 19 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MPN’ (Physical MER))

f. Rule Name: STP005F

If ‘Health Product’ and BMI < 19 and ‘LA Age’ >= 12; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘MCE’ (CBC & ESR))

g. Rule Name: STP005G

If ‘Height’ < 146 cm and ‘LA Age’ > 18 (age with month e.g. 18.1,18.5,18.6); then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Height < 146 cm @ adult age (display value))

h. Rule Name: STP005H

If ‘Height’ > 190 cm; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Height > 190 cm (display value))

i. Rule Name: STP005I 

If ‘LA Age’ < 12 and (Gender, Age, Weight and Height value not in range from below table); then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Minor life built not in range)

Sr #GenderFromAgeToAgeMinWeightMaxWeightMinHeightMaxHeight1M00.62.54.54653.52M0.7161063723M1.11.67.51271804M1.728.513.577875M2.12.69.51582946M2.7310.516.585987M3.13.611.518891038M3.741219921069M4.14.612.52195.511110M4.7513239711511M5.15.613.524.5100118.512M5.761426102122.513M6.16.614.52810412614M6.7715.531105.5129.515M7.17.61633.5109132.516M7.7816.536112135.517M8.18.617.539.511413918M8.7918.54211614219M9.19.61945.5119145.520M9.7102048.5121148.521M10.110.62151.5123.5151.522M10.71121.555126154.523M11.111.622.55812815724M11.7122462130.5160.525M12.112.62566133163.526M12.7132669.5136166.527M13.113.627.57213817028M13.7142975.514117329M14.114.630.578143175.530M14.71532.581146177.531M15.115.634.583148179.532M15.7163684.5150181.533M16.116.6378615218334M16.71738.586.815318435M17.117.639.587.5155184.536M17.7184187.5156.518637M18.1184288158186.538F00.62.34465339F0.715.59.5617040F1.11.6711.5697941F1.72813758642F2.12.6914.58092.543F2.731016.28497.544F3.13.61117.585.510245F3.7411.5199110746F4.14.612.5219511147F4.7512.82396.511548F5.15.6132597.511849F5.7613.227100.512250F6.16.613.829102125.551F6.771431105128.552F7.17.6153310713253F7.78163611013554F8.18.616.538112.513855F8.7917.24111514156F9.19.618.243117.5144.557F9.71019.246120.5148.558F10.110.620.849123.515159F10.7112252.512615460F11.111.6235612915761F11.7122559131.5160
5. Education (Rule Name: STP006[PC4]):

If ‘LA Age’ > 18 and ‘LA Qualification’ = below SSC (Q05, Q06); then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Age >18 & education below SSC)

6. FGLI previous policy (Rule Name: STP007):

If ‘Previous Policy Status’ of FGLI is either of ‘CF, CR, DC, DD, DH, DI, FA, FD, HC, HP, MD, MR, PO, RC, RD, TM) or status from rated up reason as R1 is one of the following:

DESCITEMLONGDESC1Overweight                    2Underweight                   3Dwarfism                      4Gigantism                     5Elevated Blood Pressure       6High Blood Pressure           7ECG findings                  8Stress ECG findings           9Hypertension                  10History of Heart Disease      11Heart attack                  12Coronary Angioplasty/ CABG    13High Blood Pressure and Protei14Elevated Blood Suger          15Glycosuria                    16Diabetes Mellitis             17Diabetes Insipidus            18Ele.Blood Suger(DM)/Proteinuri19Gestational Diabetes          20Diabetes & Blood Pressure     21Asthma                        22Bronchitis                    23Chronic Obstructive Pulmonary 24Respiratory disorder          25Lung surgery                  26Pneumonia                     27Chest X ray findings          28Serum Lipid Profile values    29Blood profile test values     30Anaemia                       31Low Haemoglobin               32Lymphatic system disorder     33Harmonal Disorder             34Hyperthyroidism               35Hypothyroidism                36Neurological disorder         37Meningitis                    38Psychological Disorder        39Migraine Disorders            40Epilepsy                      41Paralysis                     42Parkinsonian Disorders        43Kidney disorder               44Renal Fuction test values     45Renal calculus                46Renal failure                 47Urinary Tract Infection       48Routine urine test findings   49Proteinuria                   50Hematuria                     51Pyuria                        52Liver Function test values    53Hepatitis                     54Liver disease                 55Gastrointestinal Disorder     56Pancreatic Disease            57Ulcer                         58Gallstone                     59Musculoskeletal Disorder      60Ankylosing Spondylitis        61Osteoarthritis                62Rheumatoid Arthritis          63Gout                          64Reproductive system disorder  65Hysterectomy                  66AIDS/HIV                      67Tumor- Benign                 68Tumor- Malignant              69Cancer                        70Cyst/ Growh/ Lump             71Prostate cancer               72Vision impairemnent           73Cataract                      74Eye Disorder                  75Hearing Disorder              76Speech Disorder               77Physical deformity            78Loss of limb/s                79Poliomyelitis                 80Tobacco consumption           81Alcohal consumption           82Transplants like Bone marrow, 83Family History                84Pregnancy                     91Hazardous occupation          93Country of Residence/ National94Nationality                   95Hobbies and Pursuits          96Life style and Personal habits97Ineligibility for applied plan99Others                        BD      Build                         ME      Medical History               N2      Financial reasons             N4      Moral hazard/ Non-insurable inN5      Risky Habits/ Pursuits / AdvenN7      Other non-Medical Reason      NN      Non-Standard Age proof        OC      Occupational hazard           PR      Plan Conversion Rebate        RE      Country of Residence/ National
then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Previous policy in negative status)

7. Habits (Rule Name: STP008[PC5]):

a. Rule Name: STP008A

If ‘Mode’ = Physical or Amex and ‘[HBT_isSmoker](Cigarettes/Tobacco)’ is true; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up Code ‘QSQ’ (Smoker’s Q))

b. Rule Name: STP008B

If ‘Mode’ = Physical or Amex and ‘[HBT_isAlcoholic](Hard Liquor, Wine, Beer)’ is true; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up Code ‘QAL’ (Alcohol Q))

c. Rule Name: STP008C

If ‘Mode’ <> Physical or Amex and ‘TobacoQuantity’ > 10; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Tobaco consumption beyond STP limits)

Note: 
i. All modes that are <> Physical or Amex, are online
ii. ‘LiquorType’ when 1 means 1 type of alcohol (either Hard Liquor, beer or wine), when 2 means more than 1 type of alcohol

d. Rule Name: STP008D

If ‘Mode’ <> Physical or Amex’ and ‘LiquorType’ =1 and ‘HardLiquorQuantity’ > 700 or ‘BeerQuantity’ > 2 or ‘WineQuantity’ > 8; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Alcohol consumption beyond STP limits)

e. Rule Name: STP008E

If ‘IsNarchotic’ = true; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Narcotics / Drugs consumption)

f. Rule Name: STP008F

If ‘Mode’ <> Physical or Amex and ‘LiquorType’ > 1; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Alcohol consumption beyond STP limits)

8. Health history (Rule Name: STP009):

If any ‘HealthQuestionResponse’ = true; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Negative health history)

9. IIB Match (Rule Name: STP010):

If ‘STPPass’ = false; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Negative match in IIB)

STPPass will depend on the combination of ‘IIBStatus’ and ‘IsNegative’ as per below table (even if one status falls under false, case will fail):
E.g.: if IIBStatus = Null & Void (Insurer initiated Cancellation of contract) and IsNegative = true then stp shall fail

IIBStatusIsNegativeSTPPassProposal received/Pending for U/wTRUETRUEProposal received/Pending for U/wFALSETRUECooling off cancellation/Freelook CancellationTRUETRUECooling off cancellation/Freelook CancellationFALSETRUEFirst Premium (NB) Cheque DishonourFALSETRUEFirst Premium (NB) Cheque DishonourTRUETRUENull & Void (Insurer initiated Cancellation of contract)TRUEFALSENull & Void (Insurer initiated Cancellation of contract)FALSETRUECancelled from Inception (Client initiated viz. mis-selling complaint, etc.)TRUETRUECancelled from Inception (Client initiated viz. mis-selling complaint, etc.)FALSETRUECancelled due to other reasons (other than Null & Void/Cancelled from Inception)FALSETRUECancelled due to other reasons (other than Null & Void/Cancelled from Inception)TRUETRUEProposal declinedTRUEFALSEProposal declinedFALSETRUEWithdrawn/Not taken upTRUETRUEWithdrawn/Not taken upFALSETRUERisk PostponedTRUEFALSERisk PostponedFALSETRUEInforceTRUETRUEInforceFALSETRUEReduced Paid Up (Premium not up-to-date, however Policy in books with reduced liability)TRUETRUEReduced Paid Up (Premium not up-to-date, however Policy in books with reduced liability)FALSETRUELapsedTRUETRUELapsedFALSETRUESurrenderedTRUETRUESurrenderedFALSETRUEMaturity ClaimTRUETRUEMaturity ClaimFALSETRUEDeath Claim Intimated & being processedTRUEFALSEDeath Claim Intimated & being processedFALSETRUEDeath Claim SettledTRUEFALSEDeath Claim SettledFALSETRUEDeath Claim RepudiatedTRUEFALSEDeath Claim RepudiatedFALSETRUEJoint Life - First Death Reported/SettledTRUEFALSEJoint Life - First Death Reported/SettledFALSETRUEPremium Waiver Benefit applicable/Premiums funded by InsurerTRUETRUEPremium Waiver Benefit applicable/Premiums funded by InsurerFALSETRUEDiscontinued (ULIP)TRUETRUEDiscontinued (ULIP)FALSETRUEForeclosedTRUETRUEForeclosedFALSETRUEExtended Life CoverTRUETRUEExtended Life CoverFALSETRUEPremature TerminationTRUETRUEPremature TerminationFALSETRUE
10. IIB score (Rule Name: STP011[PC6]):

If ‘IIBScore’ >= 700 and ‘LifeAssured’ details not available in IIB list; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: New LA with IIB score > 700)

11. Life assured proposer relationship (Rule Name: STP012):

a. Rule Name: STP012A[PC7]

If LifeAssured <> Proposer and Proposer is not Corporate and Relation is in either of the following: Husband, wife, son, daughter, grandfather, grandson, granddaughter, grandmother; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: LA <> PR in individual policy)

b. Rule Name: STP012C[PC8]

If LifeAssured <> Proposer and Proposer is Corporate and Nominee Relation is Blank; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: LA <> PR in individual policy) 

c. Rule Name: STP012D[PC9]

If LifeAssured <> Proposer and Proposer is not Corporate and Relation is in either father or mother and ‘FSAR’ > 10,00,000 and ‘LA age’ >18; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: LA <> PR in individual policy)

12. Loss/gain of weight (Rule Name: STP013):

If ‘Has Weight Changed’ = true; then STP Fail else STP Pass
Letter flag status ‘O’ (follow Up code ‘MPN’ (Physical MER))

13. Nominee (Rule Name: STP014[PC10]):

If ‘Nominee Relation’ is not in either of Husband, wife, son, daughter, father, mother, grandfather, grandson, granddaughter, grandmother; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Not acceptable nominee relationship)

14. Occupation (Rule Name: STP015):
a. Rule Name: STP015A[PC11]

If ‘LA Occupation’ = Student; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘JSM’ (Education proof))

b. Rule Name: STP015B

If ‘LA Occupation’= Armed forces / Police; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code ‘Q2M’ (Armed forces Q))

c. Rule Name: STP015C

If ‘Is LAOccupationHazardous’ = true; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Hazardous occupation)

15. Product Line (Rule Name: STP016):
a. Rule Name: STP016A

If ‘Product Category’ is in either other than savings or investment; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Product <> savings / investment)

Note: currently no riders are sold so all cases will pass; this rule will need revisit when we start selling riders

b. Rule Name: STP016B

If ‘ProductCategory’ is in either savings or investment with term rider attached; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Term rider opted)

16. Location (Rule Name: STP017[PC12]):

If ‘pincode’ is in NegativePincode list and ‘Risk category’ is low; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Negative PINCode)

17. Age (Rule Name: STP018[PC13]):

a. Rule Name: STP018A to K

b. Rule Name: STP018L[PC14]

c. Rule Name: STP018M[PC15][PC16]

If ‘LifeAssured’s Age’ >= 51 and <= 55 and if ‘FSAR’ > 20,00,000; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Age > 50 & SA > 20L)

d. Rule Name: STP018N[PC17]

If ‘LifeAssured’s Age’ > 55; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Age > 55)

18. AML category & Premium (proposer) paying capacity (Rule Name: STP019)

a. Rule Name: STP019E

If ‘AMLCategory’ = High; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: AML high category AML)

b. Rule Name: STP019F

If ‘APE’ (proposer ID to be checked annual premium across all GCLI policies) > 50% ‘Annual Income (Income of Proposer)’; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code IPR (Income proof required)) 

c. Rule Name: STP019G[PC18]

19. Financial viability (Rule Name: STP020[PC19])

a. Rule Name: STP020A

If ‘LifeAssuredAge’ >= 18 and <= 40 and ‘FSAR’ <= 25 * ‘LA AnnualIncome’; then STP Pass else STP Fail
Letter flag status ‘O’ (RUW with reason: income proof for financial viability)

b. Rule Name: STP020B

If ‘LifeAssuredAge’ >= 41 and <= 45 and ‘FSAR’ <= 20 * ‘LA AnnualIncome’; then STP Pass else STP Fail
Letter flag status ‘O’ (RUW with reason: income proof for financial viability)

c. Rule Name: STP020C

If ‘LifeAssuredAge’ >= 46 and <= 50 and ‘FSAR’ <= 15 * ‘LA AnnualIncome’; then STP Pass else STP Fail
Letter flag status ‘O’ (RUW with reason: income proof for financial viability)

d. Rule Name: STP020D

If ‘LifeAssuredAge’ >= 51 and <= 55 and ‘FSAR’ <= 10 * ‘LA AnnualIncome’; then STP Pass else STP Fail
Letter flag status ‘O’ (RUW with reason: income proof for financial viability)

e. Rule Name: STP020E[PC20]

20. Premium paying capacity (Rule Name: STP022[PC21])

21. Product specific (Rule Name: STP023[PC22])

a. Rule Name: STP023A

If ‘ProductCode’ = E97 and ‘LAAge’ + ‘PolicyTerm’ > 75 and ‘APE’ > 10,00,000; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Maturity age beyond RI support)

b. Rule Name: STP023B

If ‘ProductCode’ = E98 and ‘LAAge’ + ‘PolicyTerm’ > 75 and ‘APE’ > 5,00,000; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Maturity age beyond RI support)

c. Rule Name: STP023C

If ‘ProductCode’ = E83 and ‘LAAge’ + ‘PolicyTerm’ > 75 and ‘APE’ > 2,00,000; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Maturity age beyond RI support)

d. Rule Name: STP023D

If ‘ProductCode’ = E91 or E92 and ‘LAAge’ + ‘PolicyTerm’ > 75 and ‘APE’ > 20,00,000 and ‘PremiumPaymentterm’ = 6; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Maturity age beyond RI support)

e. Rule Name: STP023E

If ‘ProductCode’ = E91 or E92 and ‘LAAge’ + ‘PolicyTerm’ > 75 and ‘APE’ >5 20,00,000 and ‘PremiumPaymentterm’ <> 6; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Maturity age beyond RI support)

f. Rule Name: STP023F[PC23]

If ‘Productcode’ = U52 and DB multiple > 15; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: DB multiple > 15)If ‘ProductCode’ = E91 or E92 and 

22. Residential status (Rule Name: STP024)

a. Rule Name: STP024A[PC24]

b. Rule Name: STP024B

If ‘Nationality(LifeAssured)’ = NRI or PIO or OCI and ‘Country’ = Standard; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code NCM (Exit Entry Details)) 

c. Rule Name: STP024C

If ‘Nationality(LifeAssured)’ = NRI or PIO or OCI and ‘Country’ = Standard; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code NDN (Proof of PIO)) 

d. Rule Name: STP024D

If ‘Nationality(LifeAssured)’ = NRI or PIO or OCI and ‘Country’ = Standard; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QNR (NRI Q)) 

e. Rule Name: STP024E

If ‘Nationality(LifeAssured)’ = NRI or PIO or OCI and ‘Country’ = Standard; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code IPR (Income proof required)) 

f. Rule Name: STP024F

If ‘Nationality(LifeAssured)’ = NRI or PIO or OCI and ‘Country’ <> Standard; then STP Fail else STP Pass
Letter Flag Status ‘O’ (RUW with reason: NRI/PIO/OCI from substandard countries)

g. Rule Name: STP024G

If ‘Nationality(LifeAssured)’ = FN; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Foreign national)

h. Rule Name: STP024H

If ‘ResidentialCountry(LifeAssured)’ = India and ‘BusinessCountry(LifeAssured)’ <> India; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Mismatch in residential status and location of work)

i. Rule Name: STP024I

If ‘Nationality(LifeAssured)’ = NRI and ‘BusinessCountry(LifeAssured)’ = India; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Mismatch in residential status and location of work)

23. Risk category (Rule Name: STP025[PC25])

a. Rule Name: STP025A

If ‘RiskCategory’ = High; then STP Fail else STP Pass
Letter Flag Status ‘O’ (RUW with reason: H risk case)

b. Rule Name: STP025B[PC26]

c. Rule Name: STP025C[PC27]

d. Rule Name: STP025D[PC28]

24. FSAR (Rule Name: STP026[PC29])

25. FSAR (Rule Name: STP027[PC30])

26. Family history (Rule Name: STP028[PC31])

If ‘LA Age’ < 60 and ‘MedicalFamilyHistory2orMoreMembers’ = true; then STP Fail Else STP Pass
Letter flag status ‘O’ (RUW with reason: Negative family history)

27. Female (Rule Name: STP029)

a. Rule Name: STP029A

Occ ClassMarital statusW<> W1 or 2PassPass3 or 4FailPass
Letter flag status ‘O’ (RUW with reason: Occupation or Marital Status is Widow)

b. Rule Name: STP029B

If ‘Gender’ = F and ‘MaritalStatus’ = W and ‘LAEducation’ is either  of the Q13, Q03, Q04, Q05, Q06; then STP Fail else STP Pass
Letter flagsStatus ‘O’ (RUW with reason: Uneducated widow)

c. Rule Name: STP029C[PC32]

d. Rule Name: STP029D[PC33]

e. Rule Name: STP029E

If ‘Gender’ = F and ‘Occupationclass’ = ‘Class 4’ and FSAR > 2,00,000; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Petty occupation with FSAR beyond STP limits)

28. Person specific (Rule Name: STP031)

a. Rule Name: STP031A

If ‘IsCriminallyConvicted’ = True; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Criminal records)

b. Rule Name: STP031B

If ‘IsPoliticallyExposed’ = True; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: PEP)

c. Rule Name: STP031C

If ‘OFAC’ = True; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Part of sanctions' list)

29. Pregnant women (Rule Name: STP032)

a. Rule Name: STP032A

If ‘Gender’ = F and ‘NoOfWeek’ <= 16; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code MPN (Physical MER))

b. Rule Name: STP032B

If ‘Gender’ = F and ‘NoOfWeek’ <= 16; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code MCE (CBC & ESR))

c. Rule Name: STP032C

If ‘Gender’ = F and ‘NoOfWeek’ <= 16; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code WGN (Gynaecologist’s report))

d. Rule Name: STP032D

If ‘Gender’ = F and ‘NoOfWeek’ > 16; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Advanced pregnancy)

30. Random medicals (Rule Name: STP033)

a. Rule Name: STP033A[PC34]

If ‘IsMedicalGenerated’ = False and ‘PolicyNumber’ / 200 = 0; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code: MPN (Physical MER))

31. Type of contract (Rule Name: STP034)

a. Rule Name: STP034A

If ‘SpecialClass’ = HUF; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QHM (HUF addendum))

b. Rule Name: STP034B

If ‘SpecialClass’ = HUF; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KNM (PAN card))

c. Rule Name: STP034C

If ‘SpecialClass’ = HUF; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KNM1 (HUF income proof required))

d. Rule Name: STP034D

If ‘SpecialClass’ = MWP; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code MWP (MWP addendum))

e. Rule Name: STP034E

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KNM (PAN card))

f. Rule Name: STP034F

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM (Address proof))

g. Rule Name: STP034G

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM1 (COI, MOA and AOA required))

h. Rule Name: STP034H

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM2 (Audited Profit & Loss statement and Balance Sheet latest 3 years))

i. Rule Name: STP034I

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QEM (EE Annexure))

j. Rule Name: STP034J

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QE1 (Latest 3 years ITR and COI))

k. Rule Name: STP034K

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA (Deed of assignment))

l. Rule Name: STP034L

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA1 (Proof of Employment (latest Form 16 OR Salary slips of 3 months OR Bank statement showing salary Credit OR CA certified Computation of LA showing salary from Firm and ITR for latest 2 years)))

m. Rule Name: STP034M

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA2 (Please provide duly filled Employer-Employee Annexure-I, II & A))

n. Rule Name: STP034N

If ‘SpecialClass’ = Employer – employee; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code PID (Please provide Details of existing and applied life cover on Life assured with terms of acceptance.))

o. Rule Name: STP034O

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KNM (PAN card))

p. Rule Name: STP034P

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM (Address proof))

q. Rule Name: STP034Q

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM1 (COI, MOA and AOA required))

r. Rule Name: STP034R

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code KGM2 (Audited Profit & Loss statement and Balance Sheet latest 3 years))

s. Rule Name: STP034S

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QEM (EE Annexure))

t. Rule Name: STP034T

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QE1 (Latest 3 years ITR and COI))

u. Rule Name: STP034U

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA (Deed of assignment))

v. Rule Name: STP034V

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA1 (Proof of Employment (latest Form 16 OR Salary slips of 3 months OR Bank statement showing salary Credit OR CA certified Computation of LA showing salary from Firm and ITR for latest 2 years)))

w. Rule Name: STP034W

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code EDA2 (Please provide duly filled Employer-Employee Annexure-I, II & A))

x. Rule Name: STP034X

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code QKN (keman Q required))

y. Rule Name: STP034Y[PC35]

If ‘SpecialClass’ = Keyman insurance; then STP Fail else STP Pass
Letter flag status ‘L’ (follow up code PID (Please provide Details of existing and applied life cover on Life assured with terms of acceptance.))

32. Medical case (Rule Name: STP035)

If ‘IsMedicalGenerated’ = true; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: Medical Case)

33. Product specific (Rule Name: STP036)[PC36]

If ‘Productcode’ = U52 and DB multiple > 15; then STP Fail else STP Pass
Letter flag status ‘O’ (RUW with reason: DB multiple > 15)
[PC1]Build validation in infinity: not to allow log-in if occupation <> student or housewife and LA annual Income = 0
[PC2]Build Qs in the journey, build acceptance limits in the STP
Get limits from RI
[PC3]Ask RI for acceptable limits and modify the rule
[PC4]Modify infinity to bar log-in of illiterate / uneducated profiles
Chk if more profiles can be blocked
Chk where additional risk can be taken e.g. low age, good income, low SA
[PC5]Take RI tolerance limits and reset rules
[PC6]Chk claim experience for 700+ buckets
[PC7]Refer excel
[PC8]Mute the rule ivo 34E
[PC9]Refer excel
[PC10]Add brother & sister
[PC11]Age < 25, SA < 20: Pass
[PC12]LA=PR, VPLC clear, SA < 20L: PASS
[PC13]JQ to be built in the journey. Refer excel for JQ details & JQ rules
[PC14]To be muted
[PC15]Modified ivo RI guidelines
[PC16]Chk with RK if we can go up to 65 ivo available RI guidelines (Rule 20E)
[PC17]Change as per 18M
[PC18]To be muted. To discuss with RK.
[PC19]Modified ivo RI guidelines
[PC20]To be muted if we do not want to extend available RI guidelines.
[PC21]To be muted ivo modified 19
[PC22]AA to chk
[PC23]Rule 36 to be moved as 23F
[PC24]To be muted
[PC25]Modified IVO new IRSM
[PC26]To be muted
[PC27]To be muted
[PC28]To be muted
[PC29]To be reviewed after MR decision
[PC30]PC to rework
[PC31]To chk if this is fixed in the journey and then make it live.
Will affect UW decisions only if we relax FSAR limits to 60+
[PC32]Conditions to match with rule 12A
[PC33]Conditions to match with rule 12A
[PC34]Counter set to 200
[PC35]New rule added
[PC36]To be muted ivo movement as rule 23F
