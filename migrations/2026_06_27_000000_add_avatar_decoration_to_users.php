<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('users', function (Blueprint $table) use ($schema) {
            if (! $schema->hasColumn('users', 'avatar_decoration')) {
                $table->mediumText('avatar_decoration')->nullable();
            }

            if (! $schema->hasColumn('users', 'avatar_decoration_updated_at')) {
                $table->dateTime('avatar_decoration_updated_at')->nullable();
            }
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('users', function (Blueprint $table) use ($schema) {
            if ($schema->hasColumn('users', 'avatar_decoration')) {
                $table->dropColumn('avatar_decoration');
            }

            if ($schema->hasColumn('users', 'avatar_decoration_updated_at')) {
                $table->dropColumn('avatar_decoration_updated_at');
            }
        });
    },
];
