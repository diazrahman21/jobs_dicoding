<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vacancy_id' => $this->vacancy_id,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'vacancy' => new VacancyResource($this->whenLoaded('vacancy')),
        ];
    }
}
