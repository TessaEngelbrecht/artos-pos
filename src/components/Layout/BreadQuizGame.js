import React, { useState } from 'react'
import { Sparkles, ThumbsUp, ThumbsDown, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Expanded array of quiz questions (original 8 + 50 more = 58 total)
const BREAD_QUIZ = [
    // Original questions
    {
        question: "True or False: Sourdough was eaten by ancient Egyptians over 3,500 years ago.",
        type: "boolean",
        correct: true,
        explanation: "True! Archaeologists found traces of sourdough in ancient Egyptian ruins.",
    },
    {
        question: "Which city is famous for its uniquely tangy sourdough bread?",
        options: ["Paris", "San Francisco", "Berlin", "Istanbul"],
        correct: "San Francisco",
        explanation: "San Francisco is famous for its local wild yeasts that give sourdough its tang.",
    },
    {
        question: "True or False: Sourdough uses wild yeast rather than commercial yeast.",
        type: "boolean",
        correct: true,
        explanation: "True! Sourdough is naturally leavened, using wild yeast and bacteria.",
    },
    {
        question: "Why does sourdough bread naturally stay fresh longer?",
        options: [
            "It contains preservatives",
            "It has more salt",
            "Its acidity deters mold",
            "It is vacuum packed"
        ],
        correct: "Its acidity deters mold",
        explanation: "The lactic acid bacteria in sourdough naturally inhibit mold growth.",
    },
    {
        question: "True or False: The flavor of sourdough bread depends on local bacteria and yeasts.",
        type: "boolean",
        correct: true,
        explanation: "Different places have unique strains of yeast and bacteria—so every bakery's flavor is distinctive!",
    },
    {
        question: "A sourdough starter is also called:",
        options: ["Mother", "Dough Papa", "Fermentoo", "Focaccia"],
        correct: "Mother",
        explanation: "The 'Mother' or 'Starter' is the living culture that leavens your bread.",
    },
    {
        question: "True or False: You should cut sourdough bread straight from the oven for best results.",
        type: "boolean",
        correct: false,
        explanation: "False! It's best to wait—moisture inside the loaf needs time to redistribute.",
    },
    {
        question: "What does NOT give sourdough its distinctive crust?",
        options: [
            "Steam during baking",
            "Sugar sprinkled on top",
            "Lactic acid bacteria",
            "High oven heat"
        ],
        correct: "Sugar sprinkled on top",
        explanation: "Sourdough's crust comes from steam and bacteria, not added sugar.",
    },

    // 50 NEW QUESTIONS
    {
        question: "What type of bacteria contributes most to sourdough's distinctive flavor?",
        options: ["Lactobacillus", "E.coli", "Salmonella", "Bacillus"],
        correct: "Lactobacillus",
        explanation: "Lactobacillus bacteria produces lactic acid, giving sourdough its tangy flavor.",
    },
    {
        question: "Which ingredient is NOT typically in traditional sourdough bread?",
        options: ["Flour", "Water", "Commercial yeast", "Salt"],
        correct: "Commercial yeast",
        explanation: "Sourdough uses natural wild yeast instead of commercial yeast.",
    },
    {
        question: "True or False: Sourdough fermentation improves nutrient availability.",
        type: "boolean",
        correct: true,
        explanation: "Fermentation breaks down phytic acid, increasing nutrient absorption.",
    },
    {
        question: "How long can a sourdough starter be kept alive?",
        options: ["A few weeks", "Several months", "Years or even generations", "Only hours"],
        correct: "Years or even generations",
        explanation: "Starters can be maintained indefinitely if cared for properly.",
    },
    {
        question: "Why do sourdough loaves have holes in the crumb?",
        options: ["Bubbles from yeast fermentation", "Added baking soda", "Improper baking", "Cooling too fast"],
        correct: "Bubbles from yeast fermentation",
        explanation: "Wild yeasts produce carbon dioxide gas, forming these characteristic holes.",
    },
    {
        question: "True or False: Sourdough bread has a lower glycemic index than regular bread.",
        type: "boolean",
        correct: true,
        explanation: "Sourdough typically leads to slower blood sugar spikes.",
    },
    {
        question: "What is the main leavening agent in sourdough?",
        options: ["Commercial yeast", "Sourdough starter", "Baking powder", "Baking soda"],
        correct: "Sourdough starter",
        explanation: "The starter contains wild yeast and bacteria which leaven the bread.",
    },
    {
        question: "Which ancient civilization is credited with developing sourdough?",
        options: ["France", "Egypt", "Italy", "Germany"],
        correct: "Egypt",
        explanation: "Ancient Egyptians were among the first bakers to use sourdough.",
    },
    {
        question: "True or False: You should feed your sourdough starter daily when active.",
        type: "boolean",
        correct: true,
        explanation: "Daily feeding helps maintain a healthy, active starter.",
    },
    {
        question: "What happens if you never feed your sourdough starter?",
        options: ["It dies", "It becomes toxic", "It remains unchanged", "It multiplies"],
        correct: "It dies",
        explanation: "Without feeding, the yeast and bacteria eventually die off.",
    },
    {
        question: "What tool helps create steam in a home oven for sourdough bread?",
        options: ["Ice cubes", "Pan of water", "Spray bottle", "All of the above"],
        correct: "All of the above",
        explanation: "Various methods help create steam which develops the crust.",
    },
    {
        question: "True or False: Sourdough starters can be shared with friends.",
        type: "boolean",
        correct: true,
        explanation: "Starters can be divided and given to others, preserving cultures.",
    },
    {
        question: "How does hydration level affect sourdough dough?",
        options: ["Affects stickiness", "Influences crumb texture", "Changes baking time", "All of the above"],
        correct: "All of the above",
        explanation: "Hydration impacts many dough characteristics and final bread quality.",
    },
    {
        question: "True or False: Overproofing sourdough always makes it more sour.",
        type: "boolean",
        correct: false,
        explanation: "Overproofing can lead to collapse and off-flavors, not necessarily more sourness.",
    },
    {
        question: "What is 'autolyse' in sourdough baking?",
        options: ["Resting flour and water", "Adding yeast", "Baking process", "Kneading technique"],
        correct: "Resting flour and water",
        explanation: "Autolyse helps gluten development and improves dough texture.",
    },
    {
        question: "What does scoring bread before baking accomplish?",
        options: ["Controls expansion", "Adds flavor", "Browns crust faster", "Pre-cooks bread"],
        correct: "Controls expansion",
        explanation: "Scoring directs how the bread expands during baking.",
    },
    {
        question: "True or False: Traditional sourdough bread contains no added sugar.",
        type: "boolean",
        correct: true,
        explanation: "Most traditional sourdough recipes are sugar-free.",
    },
    {
        question: "What type of flour is best for starting a sourdough culture?",
        options: ["Whole wheat", "Rye", "White bread flour", "Any of these work"],
        correct: "Any of these work",
        explanation: "Different flours yield different starter characteristics, all can work.",
    },
    {
        question: "Why is sourdough often more digestible than regular bread?",
        options: ["Fermentation breaks down gluten", "It has enzymes", "No carbohydrates", "More fiber"],
        correct: "Fermentation breaks down gluten",
        explanation: "Long fermentation partially breaks down gluten and other compounds.",
    },
    {
        question: "True or False: A bubbly sourdough starter indicates it's ready to use.",
        type: "boolean",
        correct: true,
        explanation: "Bubbling indicates active fermentation and a healthy starter.",
    },
    {
        question: "What is the ideal temperature for sourdough fermentation?",
        options: ["15-20°C", "22-28°C", "30-35°C", "Above 40°C"],
        correct: "22-28°C",
        explanation: "This temperature range promotes optimal yeast and bacterial activity.",
    },
    {
        question: "True or False: Sourdough contains probiotics that survive baking.",
        type: "boolean",
        correct: false,
        explanation: "High baking temperatures kill the live cultures, though benefits may remain.",
    },
    {
        question: "What gives sourdough its characteristic chewy texture?",
        options: ["Wild yeast", "Gluten development", "Long baking", "Steam injection"],
        correct: "Gluten development",
        explanation: "Well-developed gluten creates the chewy, elastic texture.",
    },
    {
        question: "How often should you discard and refresh your starter?",
        options: ["Never", "Daily when active", "Only when moldy", "Every few hours"],
        correct: "Daily when active",
        explanation: "Regular refreshing keeps the starter healthy and balanced.",
    },
    {
        question: "True or False: Rye flour makes sourdough more sour than wheat flour.",
        type: "boolean",
        correct: true,
        explanation: "Rye flour contains more nutrients that feed acid-producing bacteria.",
    },
    {
        question: "What is a 'levain' in sourdough baking?",
        options: ["A type of flour", "A pre-ferment", "A baking tool", "A bread shape"],
        correct: "A pre-ferment",
        explanation: "Levain is a portion of starter built up for making bread.",
    },
    {
        question: "True or False: Sourdough can be made entirely gluten-free.",
        type: "boolean",
        correct: true,
        explanation: "Gluten-free flours like rice or buckwheat can be used for sourdough.",
    },
    {
        question: "What causes the 'oven spring' in sourdough bread?",
        options: ["Steam expansion", "Yeast activity from heat", "Gluten stretching", "All of the above"],
        correct: "All of the above",
        explanation: "Multiple factors contribute to the rapid rise when bread enters the oven.",
    },
    {
        question: "Which tool is most helpful for shaping sourdough?",
        options: ["Bench scraper", "Rolling pin", "Whisk", "Measuring cup"],
        correct: "Bench scraper",
        explanation: "A bench scraper helps shape and move sticky sourdough dough.",
    },
    {
        question: "True or False: Sourdough starters can be frozen for long-term storage.",
        type: "boolean",
        correct: true,
        explanation: "Starters can be frozen, though they need time to reactivate.",
    },
    {
        question: "What creates the thick, chewy crust on artisan sourdough?",
        options: ["High oven temperature", "Steam during baking", "Long fermentation", "All of the above"],
        correct: "All of the above",
        explanation: "Multiple factors work together to create the perfect crust.",
    },
    {
        question: "Why do bakers often use a Dutch oven for sourdough?",
        options: ["Even heating", "Steam retention", "Better crust", "All of the above"],
        correct: "All of the above",
        explanation: "Dutch ovens create an ideal baking environment for sourdough.",
    },
    {
        question: "True or False: Sourdough bread should sound hollow when tapped if properly baked.",
        type: "boolean",
        correct: true,
        explanation: "A hollow sound indicates the bread is fully baked through.",
    },
    {
        question: "What is the purpose of bulk fermentation in sourdough?",
        options: ["Flavor development", "Gluten strengthening", "Gas production", "All of the above"],
        correct: "All of the above",
        explanation: "Bulk fermentation accomplishes multiple important functions.",
    },
    {
        question: "Which country has sourdough bread called 'Pain de Campagne'?",
        options: ["Italy", "France", "Germany", "Spain"],
        correct: "France",
        explanation: "Pain de Campagne is a traditional French country sourdough bread.",
    },
    {
        question: "True or False: Adding honey to sourdough starter helps it ferment faster.",
        type: "boolean",
        correct: false,
        explanation: "Honey has antimicrobial properties that can actually inhibit fermentation.",
    },
    {
        question: "What is the white film that sometimes forms on starter called?",
        options: ["Hooch", "Kahm yeast", "Mold", "Levain"],
        correct: "Kahm yeast",
        explanation: "Kahm yeast is usually harmless but indicates the starter needs attention.",
    },
    {
        question: "How long does sourdough typically take from start to finish?",
        options: ["2-4 hours", "8-12 hours", "1-3 days", "1 week"],
        correct: "1-3 days",
        explanation: "Including fermentation and proofing, sourdough is a multi-day process.",
    },
    {
        question: "True or False: Sourdough discard can be used in other recipes.",
        type: "boolean",
        correct: true,
        explanation: "Starter discard is perfect for pancakes, crackers, and many other recipes.",
    },
    {
        question: "What makes San Francisco sourdough unique?",
        options: ["Local wild yeasts", "Specific bacteria strain", "Climate conditions", "All of the above"],
        correct: "All of the above",
        explanation: "The unique local microorganisms and climate create San Francisco's distinctive flavor.",
    },
    {
        question: "Which grain was historically used most for sourdough in Northern Europe?",
        options: ["Wheat", "Rye", "Barley", "Oats"],
        correct: "Rye",
        explanation: "Rye was the predominant grain in Northern European sourdough traditions.",
    },
    {
        question: "True or False: Sourdough bread improves in flavor over the first day after baking.",
        type: "boolean",
        correct: true,
        explanation: "The flavors continue to develop and the crumb texture improves with time.",
    },
    {
        question: "What is the term for the final shaping of sourdough before proofing?",
        options: ["Folding", "Rounding", "Batching", "Forming"],
        correct: "Forming",
        explanation: "Forming or final shaping gives the bread its ultimate structure.",
    },
    {
        question: "Why do some bakers add a small amount of commercial yeast to sourdough?",
        options: ["Better flavor", "Faster rise", "Longer shelf life", "Easier handling"],
        correct: "Faster rise",
        explanation: "A small amount of commercial yeast can speed up fermentation when needed.",
    },
    {
        question: "True or False: Sourdough bread can be made without kneading.",
        type: "boolean",
        correct: true,
        explanation: "Many sourdough methods use folding techniques instead of traditional kneading.",
    },
    {
        question: "What is the minimum age for a sourdough starter to be considered mature?",
        options: ["3 days", "1 week", "2 weeks", "1 month"],
        correct: "2 weeks",
        explanation: "Most starters need at least 2 weeks to develop stable, balanced cultures.",
    },
    {
        question: "Which type of water is best for sourdough starter?",
        options: ["Tap water", "Distilled water", "Filtered water", "Spring water"],
        correct: "Filtered water",
        explanation: "Filtered water removes chlorine while retaining beneficial minerals.",
    },
    {
        question: "True or False: Sourdough starter should always be kept at room temperature.",
        type: "boolean",
        correct: false,
        explanation: "Starters can be refrigerated to slow fermentation when not actively baking.",
    }
]

function shuffle(arr) {
    return arr.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

export default function BreadQuizGame() {
    const initialQuestions = shuffle(BREAD_QUIZ)
    const [questions, setQuestions] = useState(initialQuestions)
    const [current, setCurrent] = useState(0)
    const [userAnswer, setUserAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)

    const currQ = questions[current]

    const handleAnswer = (answer) => {
        setUserAnswer(answer)
        setShowResult(true)
    }

    const handleNext = () => {
        if (current < questions.length - 1) {
            setCurrent(current + 1)
            setUserAnswer(null)
            setShowResult(false)
        } else {
            // Re-shuffle for a new session
            setQuestions(shuffle(BREAD_QUIZ))
            setCurrent(0)
            setUserAnswer(null)
            setShowResult(false)
        }
    }

    return (
        <div className="relative bg-gradient-to-r from-yellow-50 to-amber-100 border border-yellow-300 rounded-xl shadow-lg mx-auto mt-2 mb-10 max-w-xl px-6 sm:px-10 py-7 overflow-hidden">
            <div className="flex items-center mb-1 sm:mb-3">
                <h2 className="font-bold text-lg sm:text-xl text-amber-800 tracking-tight">🍞 Sourdough Quiz</h2>
            </div>
            <motion.div
                className="mt-2 mb-4"
                key={currQ.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <div className="text-base sm:text-lg font-semibold text-primary text-center px-1 mb-2">
                    {currQ.question}
                </div>
            </motion.div>

            {/* Answer options */}
            <div className="flex flex-col gap-3">
                {currQ.type === "boolean" ? (
                    <>
                        <button
                            className={`w-full rounded-lg px-6 py-2 border text-base font-medium shadow-sm transition-all
                ${showResult ?
                                    (currQ.correct === true ? "bg-green-200 border-green-400 text-green-900" : "bg-gray-100 border-gray-300 text-gray-500")
                                    : "bg-white border-gray-300 hover:bg-amber-100 active:scale-95"}`}
                            disabled={showResult}
                            onClick={() => handleAnswer(true)}
                        >
                            True
                        </button>
                        <button
                            className={`w-full rounded-lg px-6 py-2 border text-base font-medium shadow-sm transition-all
                ${showResult ?
                                    (currQ.correct === false ? "bg-green-200 border-green-400 text-green-900" : "bg-gray-100 border-gray-300 text-gray-500")
                                    : "bg-white border-gray-300 hover:bg-amber-100 active:scale-95"}`}
                            disabled={showResult}
                            onClick={() => handleAnswer(false)}
                        >
                            False
                        </button>
                    </>
                ) : currQ.options ? (
                    currQ.options.map((option, i) => (
                        <button
                            key={option}
                            className={`w-full rounded-lg px-6 py-2 border text-base font-medium shadow-sm transition-all
                ${showResult ? (
                                    option === currQ.correct ?
                                        "bg-green-200 border-green-400 text-green-900"
                                        : (userAnswer === option ? "bg-red-200 border-red-400 text-red-900" : "bg-gray-100 border-gray-300 text-gray-600")
                                ) : "bg-white border-gray-300 hover:bg-amber-100 active:scale-95"}`}
                            disabled={showResult}
                            onClick={() => handleAnswer(option)}
                        >
                            {option}
                        </button>
                    ))
                ) : null}
            </div>

            {/* Feedback */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        className="mt-4 py-3 px-3 md:px-4 rounded-xl flex items-center justify-between"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{ background: (userAnswer === currQ.correct || userAnswer === currQ.correct) ? "#d1fae5" : "#fee2e2" }}
                    >
                        <div className="flex items-center">
                            {(userAnswer === currQ.correct || userAnswer === currQ.correct)
                                ? <ThumbsUp size={24} className="text-green-600 mr-2" />
                                : <ThumbsDown size={24} className="text-red-500 mr-2" />
                            }
                            <span className="font-semibold text-base sm:text-lg text-gray-700">
                                {(userAnswer === currQ.correct || userAnswer === currQ.correct) ? "Correct!" : "Not quite!"}
                            </span>
                        </div>
                        <div className="ml-5 flex items-center text-amber-800 font-medium">
                            <Info size={18} className="mr-1" />
                            <span className="text-xs sm:text-sm">{currQ.explanation}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Next Question Button */}
            <div className="flex justify-center mt-6">
                <button
                    className="bg-primary text-white px-6 py-2 rounded-full font-semibold shadow-sm hover:bg-amber-700 transition disabled:opacity-50"
                    onClick={handleNext}
                    disabled={!showResult}
                >
                    {current < questions.length - 1 ? "Next Fact" : "Play Again"}
                </button>
            </div>
        </div>
    )
}
