"use strict";

class QuizElementsHelper {
 
  constructor(app, quizCard, questionCard, resultCard, quiz) {
    this.app = app;
    this.quiz = quiz;
    this.quizCard = quizCard;
    this.questionCard = questionCard;
    this.resultCard = resultCard;

    // find & assign elements
    this.assignElements();

    // initialize the listeners
    this.initListeners();

    // show quiz details card
    this.showQuizCard();
  }


  assignElements() {
    // Quiz Card Elements
    this.quizCard.startBtn = this.quizCard.querySelector(
      ".quiz-details__start-btn"
    );
    this.quizCard.titleElm = this.quizCard.querySelector(
      ".quiz-details__title"
    );
    this.quizCard.descriptionElm = this.quizCard.querySelector(
      ".quiz-details__description"
    );
    this.quizCard.metaQCElm = this.quizCard.querySelector(
      ".quiz-details__meta.--qc strong"
    );
    this.quizCard.metaTimeElm = this.quizCard.querySelector(
      ".quiz-details__meta.--t strong"
    );

    this.questionCard.progressRemainingTimeElm = document.querySelector(
      ".questions-card__remaining-time"
    );
    this.questionCard.progressQuestionCountElm = document.querySelector(
      ".questions-card__q-count"
    );
    this.questionCard.progressbarElm = document.querySelector(
      ".questions-card__progress .--value"
    );
    this.questionCard.questionTitleElm = document.getElementById(
      "question-title"
    );
    this.questionCard.optionOneElm = document.querySelector(
      "#option-one ~ label"
    );
    this.questionCard.optionTwoElm = document.querySelector(
      "#option-two ~ label"
    );
    this.questionCard.optionThreeElm = document.querySelector(
      "#option-three ~ label"
    );
    this.questionCard.optionFourElm = document.querySelector(
      "#option-four ~ label"
    );
    this.questionCard.nextBtn = this.app.querySelector("#next-btn");
    this.questionCard.stopBtn = this.app.querySelector("#stop-btn");

    // Result Card Elements
    this.resultCard.gotoHome = this.resultCard.querySelector("#go-to-home");
    this.resultCard.scoreElm = this.resultCard.querySelector("#score");
  }

 
  initListeners() {
    this.quizCard.startBtn.addEventListener(
      "click",
      this.showQuestionsCard.bind(this)
    );
    this.questionCard.nextBtn.addEventListener(
      "click",
      this.nextBtnHandler.bind(this)
    );
    this.questionCard.stopBtn.addEventListener(
      "click",
      this.stopBtnHandler.bind(this)
    );
    this.resultCard.gotoHome.addEventListener(
      "click",
      this.hideResultCard.bind(this)
    );
  }


  showQuizCard() {
    this.quizCard.titleElm.innerText = this.quiz.title;
    this.quizCard.descriptionElm.innerText = this.quiz.description;
    this.quizCard.metaQCElm.innerText = this.quiz._questions.length;
    this.quizCard.metaTimeElm.innerText = this.quiz._time;

    this.quizCard.classList.add("show");
  }

  hideQuizCard() {
    this.quizCard.classList.remove("show");
  }


  showQuestionsCard() {
    this.hideQuizCard();

    this.questionCard.classList.add("show");
    this.questionCard.classList.remove("time-over");

    this.startQuiz();
  }

  hideQuestionsCard() {
    this.questionCard.classList.remove("show");
  }


  showResultCard(result) {
    this.hideQuestionsCard();

    if (this.resultCard.scoreElm && result)
      this.resultCard.scoreElm.innerText = Math.floor(result.score * 10) / 10;

    this.resultCard.classList.add("show");
  }


  hideResultCard() {
    this.resultCard.classList.remove("show");
    this.showQuizCard();
  }

  startQuiz() {
    this.resetPreviousQuiz();
    this.quiz.reset();
    const firstQuestion = this.quiz.start();
    if (firstQuestion) {
      this.parseNextQuestion(firstQuestion);
    }

    this.questionCard.nextBtn.innerText = "Next";

    this._setProgressTicker();
  }

  _setProgressTicker() {
    this.remainingTimeInterval = setInterval(() => {
      const qTime = this.quiz.timeDetails;
      if (qTime && qTime.remainingTime) {
        // update remaining time span
        this.questionCard.progressRemainingTimeElm.innerText =
          qTime.remainingTime;

        // update progressbar
        let progressPercent =
          ((qTime.quizTime - qTime.elapsedTime) * 100) / qTime.quizTime;
        if (progressPercent < 0) progressPercent = 0;
        this.questionCard.progressbarElm.style.width = progressPercent + "%";
      }

      // clear & stop interval when time over
      if (qTime.timeOver) {
        this.questionCard.classList.add("time-over");
        this.questionCard.nextBtn.innerText = "Show Result";
        clearInterval(this.remainingTimeInterval);
      }
    }, 1000);
  }


  parseNextQuestion(question) {
    const selectedOption = document.querySelector(
      "input[name=question-option]:checked"
    );

    this.questionCard.progressQuestionCountElm.innerText = `Question ${this.quiz
      ._currentQuestionIndex + 1}/${this.quiz._questions.length}`;
    this.questionCard.questionTitleElm.setAttribute(
      "data-qn",
      `Q ${this.quiz._currentQuestionIndex + 1}:`
    );
    this.questionCard.questionTitleElm.innerText = question.title;

    this.questionCard.optionOneElm.innerText = question.options[0];
    this.questionCard.optionTwoElm.innerText = question.options[1];
    this.questionCard.optionThreeElm.innerText = question.options[2];
    this.questionCard.optionFourElm.innerText = question.options[3];

    // reset pre selected options on every next
    if (selectedOption) selectedOption.checked = false;
  }

  /**
   * To reset the previous quiz status before restarting it.
   */
  resetPreviousQuiz() {
    this.quiz.stop();
    clearInterval(this.remainingTimeInterval);

    this.resultCard.scoreElm.innerText = 0;
    this.questionCard.progressRemainingTimeElm.innerText = "00:00";
    this.questionCard.progressbarElm.style.width = "100%";
  }

  
  nextBtnHandler() {
    const selectedOption = document.querySelector(
      "input[name=question-option]:checked"
    );

    let result;
    if (!selectedOption) {
      result = this.quiz.skipCurrentQuestion();
    } else {
      result = this.quiz.answerCurrentQuestion(selectedOption.value);
    }

    if (result.finished || result.timeOver) {
      this.showResultCard(result.result);
    } else if (result) {
      this.parseNextQuestion(result.nextQ);
    }
  }

  
  stopBtnHandler() {
    this.resetPreviousQuiz();
    this.showResultCard();
  }
}
