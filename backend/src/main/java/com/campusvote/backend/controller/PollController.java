package com.campusvote.backend.controller;

import com.campusvote.backend.entity.User;
import com.campusvote.backend.poll.Poll;
import com.campusvote.backend.poll.PollOption;
import com.campusvote.backend.poll.PollOptionRepository;
import com.campusvote.backend.poll.PollOptionResponse;
import com.campusvote.backend.poll.PollRepository;
import com.campusvote.backend.poll.PollRequest;
import com.campusvote.backend.poll.PollResponse;
import com.campusvote.backend.repository.UserRepository;
import com.campusvote.backend.vote.VoteRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/polls")
@CrossOrigin(origins = "*")
public class PollController {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public PollController(
            PollRepository pollRepository,
            PollOptionRepository pollOptionRepository,
            UserRepository userRepository,
            VoteRepository voteRepository) {

        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.userRepository = userRepository;
        this.voteRepository = voteRepository;
    }

    // ==========================================================
    // GET ALL POLLS
    // ==========================================================

    @GetMapping
    public ResponseEntity<List<PollResponse>> getAllPolls() {

        List<Poll> polls = pollRepository.findAll();

        List<PollResponse> responseList = new ArrayList<>();

        List<PollOption> allOptions =
                pollOptionRepository.findAll();

        for (Poll poll : polls) {

            List<PollOptionResponse> optionResponses =
                    new ArrayList<>();

            for (PollOption option : allOptions) {

                if (option.getPoll() != null
                        && option.getPoll().getId() != null
                        && option.getPoll().getId().equals(poll.getId())) {

                    optionResponses.add(
                            new PollOptionResponse(
                                    option.getId(),
                                    option.getOptionText()
                            )
                    );
                }
            }

            responseList.add(
                    new PollResponse(
                            poll.getId(),
                            poll.getQuestion(),
                            poll.getDescription(),
                            poll.getStartDate(),
                            poll.getEndDate(),
                            poll.isActive(),
                            optionResponses
                    )
            );
        }

        return ResponseEntity.ok(responseList);
    }

    // ==========================================================
    // GET SINGLE POLL
    // ==========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPollById(
            @PathVariable Long id) {

        Poll poll =
                pollRepository.findById(id).orElse(null);

        if (poll == null) {
            return ResponseEntity.notFound().build();
        }

        List<PollOption> options =
                pollOptionRepository.findByPollId(id);

        List<PollOptionResponse> optionResponses =
                new ArrayList<>();

        for (PollOption option : options) {

            optionResponses.add(
                    new PollOptionResponse(
                            option.getId(),
                            option.getOptionText()
                    )
            );
        }

        PollResponse response =
                new PollResponse(
                        poll.getId(),
                        poll.getQuestion(),
                        poll.getDescription(),
                        poll.getStartDate(),
                        poll.getEndDate(),
                        poll.isActive(),
                        optionResponses
                );

        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // CREATE POLL
    // ==========================================================

    @PostMapping
    public ResponseEntity<?> createPoll(
            @RequestBody PollRequest request) {

        try {

            // Validate question
            if (request.getQuestion() == null
                    || request.getQuestion().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Poll question is required.");
            }

            // Validate options
            if (request.getOptions() == null) {

                return ResponseEntity.badRequest()
                        .body("At least 2 options are required.");
            }

            List<String> cleanedOptions =
                    new ArrayList<>();

            for (String optionText :
                    request.getOptions()) {

                if (optionText == null) {
                    continue;
                }

                String cleanedOption =
                        optionText.trim();

                if (!cleanedOption.isEmpty()) {
                    cleanedOptions.add(cleanedOption);
                }
            }

            if (cleanedOptions.size() < 2) {

                return ResponseEntity.badRequest()
                        .body(
                                "At least 2 valid options are required."
                        );
            }

            // Check duplicate options
            List<String> lowerCaseOptions =
                    new ArrayList<>();

            for (String optionText :
                    cleanedOptions) {

                lowerCaseOptions.add(
                        optionText.toLowerCase()
                );
            }

            long uniqueCount =
                    lowerCaseOptions
                            .stream()
                            .distinct()
                            .count();

            if (uniqueCount != cleanedOptions.size()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Poll options must be unique."
                        );
            }

            // Validate dates
            if (request.getStartDate() != null
                    && request.getEndDate() != null
                    && request.getEndDate()
                    .isBefore(request.getStartDate())) {

                return ResponseEntity.badRequest()
                        .body(
                                "End date must be after start date."
                        );
            }

            // Create poll
            Poll poll = new Poll();

            poll.setQuestion(
                    request.getQuestion().trim()
            );

            poll.setDescription(
                    request.getDescription()
            );

            poll.setStartDate(
                    request.getStartDate()
            );

            poll.setEndDate(
                    request.getEndDate()
            );

            poll.setActive(
                    request.isActive()
            );

            // Find creator
            if (request.getCreatedById() != null) {

                User user =
                        userRepository.findById(
                                request.getCreatedById()
                        ).orElse(null);

                if (user == null) {

                    return ResponseEntity.badRequest()
                            .body(
                                    "Creator user not found."
                            );
                }

                poll.setCreatedBy(user);
            }

            Poll savedPoll =
                    pollRepository.save(poll);

            // Create options
            List<PollOption> pollOptions =
                    new ArrayList<>();

            for (String optionText :
                    cleanedOptions) {

                PollOption option =
                        new PollOption();

                option.setOptionText(
                        optionText
                );

                option.setPoll(
                        savedPoll
                );

                pollOptions.add(option);
            }

            pollOptionRepository.saveAll(
                    pollOptions
            );

            return ResponseEntity.ok(
                    "Poll created successfully."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Unable to create poll: "
                                    + getSafeErrorMessage(e)
                    );
        }
    }

    // ==========================================================
    // DELETE POLL
    // ==========================================================

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePoll(
            @PathVariable Long id) {

        try {

            if (!pollRepository.existsById(id)) {

                return ResponseEntity.notFound()
                        .build();
            }

            // Delete votes first
            voteRepository.deleteByPollId(id);

            // Delete options second
            pollOptionRepository.deleteByPollId(id);

            // Delete poll last
            pollRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Poll deleted successfully."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Unable to delete poll: "
                                    + getSafeErrorMessage(e)
                    );
        }
    }

    // ==========================================================
    // UPDATE POLL
    // ==========================================================

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePoll(
            @PathVariable Long id,
            @RequestBody PollRequest request) {

        try {

            // --------------------------------------------------
            // FIND POLL
            // --------------------------------------------------

            Poll poll =
                    pollRepository.findById(id).orElse(null);

            if (poll == null) {

                return ResponseEntity.notFound()
                        .build();
            }

            // --------------------------------------------------
            // VALIDATE QUESTION
            // --------------------------------------------------

            if (request.getQuestion() == null
                    || request.getQuestion().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Poll question is required."
                        );
            }

            // --------------------------------------------------
            // VALIDATE DATES
            // --------------------------------------------------

            if (request.getStartDate() != null
                    && request.getEndDate() != null
                    && request.getEndDate()
                    .isBefore(request.getStartDate())) {

                return ResponseEntity.badRequest()
                        .body(
                                "End date must be after start date."
                        );
            }

            // --------------------------------------------------
            // UPDATE BASIC DETAILS
            // --------------------------------------------------

            poll.setQuestion(
                    request.getQuestion().trim()
            );

            poll.setDescription(
                    request.getDescription()
            );

            poll.setStartDate(
                    request.getStartDate()
            );

            poll.setEndDate(
                    request.getEndDate()
            );

            poll.setActive(
                    request.isActive()
            );

            // --------------------------------------------------
            // CHECK EXISTING VOTES
            // --------------------------------------------------

            long totalVotes =
                    voteRepository.countByPollId(id);

            // ==================================================
            // CASE 1:
            // NO VOTES
            // ==================================================

            if (totalVotes == 0) {

                if (request.getOptions() == null) {

                    return ResponseEntity.badRequest()
                            .body(
                                    "At least 2 options are required."
                            );
                }

                // Clean options manually.
                // This avoids Eclipse null-safety warnings.
                List<String> cleanedOptions =
                        new ArrayList<>();

                for (String optionText :
                        request.getOptions()) {

                    if (optionText == null) {
                        continue;
                    }

                    String cleanedOption =
                            optionText.trim();

                    if (!cleanedOption.isEmpty()) {
                        cleanedOptions.add(
                                cleanedOption
                        );
                    }
                }

                // At least 2 options
                if (cleanedOptions.size() < 2) {

                    return ResponseEntity.badRequest()
                            .body(
                                    "At least 2 valid options are required."
                            );
                }

                // Check duplicates manually
                List<String> lowerCaseOptions =
                        new ArrayList<>();

                for (String optionText :
                        cleanedOptions) {

                    lowerCaseOptions.add(
                            optionText.toLowerCase()
                    );
                }

                long uniqueCount =
                        lowerCaseOptions
                                .stream()
                                .distinct()
                                .count();

                if (uniqueCount != cleanedOptions.size()) {

                    return ResponseEntity.badRequest()
                            .body(
                                    "Poll options must be unique."
                            );
                }

                // Save poll details first
                pollRepository.save(poll);

                // Delete old options
                pollOptionRepository.deleteByPollId(id);

                // Create new options
                List<PollOption> newOptions =
                        new ArrayList<>();

                for (String optionText :
                        cleanedOptions) {

                    PollOption option =
                            new PollOption();

                    option.setOptionText(
                            optionText
                    );

                    option.setPoll(
                            poll
                    );

                    newOptions.add(
                            option
                    );
                }

                pollOptionRepository.saveAll(
                        newOptions
                );

                return ResponseEntity.ok(
                        "Poll updated successfully."
                );
            }

            // ==================================================
            // CASE 2:
            // POLL ALREADY HAS VOTES
            // ==================================================

            /*
             * Do not delete or replace options if votes already
             * exist. Existing votes refer to those options.
             *
             * We can still update:
             * - Question
             * - Description
             * - Start date
             * - End date
             * - Active status
             */

            pollRepository.save(poll);

            return ResponseEntity.ok(
                    "Poll details updated successfully. "
                            + "Existing options were preserved because "
                            + totalVotes
                            + " vote(s) already exist."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Unable to update poll: "
                                    + getSafeErrorMessage(e)
                    );
        }
    }

    // ==========================================================
    // SAFE ERROR MESSAGE
    // ==========================================================

    private String getSafeErrorMessage(
            Exception e) {

        if (e == null) {
            return "Unknown error.";
        }

        String message =
                e.getMessage();

        if (message == null
                || message.trim().isEmpty()) {

            return e.getClass()
                    .getSimpleName();
        }

        return message;
    }
}